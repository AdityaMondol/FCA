import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(private supabaseService: SupabaseService) {}

  async getPublicMedia(limit = 20, offset = 0) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('media')
      .select(`
        id,
        title,
        description,
        file_path,
        file_type,
        file_size,
        created_at,
        profiles!media_uploaded_by_fkey (
          first_name,
          last_name
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException('Failed to fetch media');
    }

    return data.map(media => ({
      id: media.id,
      title: media.title,
      description: media.description,
      filePath: media.file_path,
      fileType: media.file_type,
      fileSize: media.file_size,
      createdAt: media.created_at,
      uploader: media.profiles ? {
        firstName: (media.profiles as any)?.first_name,
        lastName: (media.profiles as any)?.last_name,
      } : null,
    }));
  }

  async getMediaById(id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('media')
      .select(`
        id,
        title,
        description,
        file_path,
        file_type,
        file_size,
        is_public,
        created_at,
        profiles!media_uploaded_by_fkey (
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .eq('is_public', true)
      .single();

    if (error || !data) {
      throw new NotFoundException('Media not found');
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      filePath: data.file_path,
      fileType: data.file_type,
      fileSize: data.file_size,
      isPublic: data.is_public,
      createdAt: data.created_at,
      uploader: data.profiles ? {
        firstName: (data.profiles as any)?.first_name,
        lastName: (data.profiles as any)?.last_name,
      } : null,
    };
  }

  async uploadMedia(uploaderId: string, uploadMediaDto: UploadMediaDto, file: any) {
    const supabase = this.supabaseService.getClient();

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images and videos are allowed.');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB.');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `media/${fileName}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          duplex: 'half'
        });

      if (uploadError) {
        throw new BadRequestException(`File upload failed: ${uploadError.message}`);
      }

      const { data: mediaData, error: dbError } = await supabase
        .from('media')
        .insert({
          title: uploadMediaDto.title,
          description: uploadMediaDto.description,
          file_path: uploadData.path,
          file_type: file.mimetype,
          file_size: file.size,
          uploaded_by: uploaderId,
          is_public: uploadMediaDto.isPublic ?? true,
        })
        .select()
        .single();

      if (dbError) {
        await supabase.storage.from('media').remove([uploadData.path]);
        throw new BadRequestException('Failed to save media record');
      }

      return {
        message: 'Media uploaded successfully',
        media: {
          id: mediaData.id,
          title: mediaData.title,
          description: mediaData.description,
          filePath: mediaData.file_path,
          fileType: mediaData.file_type,
          fileSize: mediaData.file_size,
          isPublic: mediaData.is_public,
          createdAt: mediaData.created_at,
        },
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Media upload failed');
    }
  }

  async updateMedia(mediaId: string, userId: string, updateMediaDto: UpdateMediaDto) {
    const supabase = this.supabaseService.getClient();

    const { data: existingMedia } = await supabase
      .from('media')
      .select('uploaded_by')
      .eq('id', mediaId)
      .single();

    if (!existingMedia) {
      throw new NotFoundException('Media not found');
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isUploader = existingMedia.uploaded_by === userId;
    const isAdmin = userProfile?.role === 'admin';

    if (!isUploader && !isAdmin) {
      throw new ForbiddenException('You can only update your own media');
    }

    const { data, error } = await supabase
      .from('media')
      .update({
        ...(updateMediaDto.title && { title: updateMediaDto.title }),
        ...(updateMediaDto.description !== undefined && { description: updateMediaDto.description }),
        ...(updateMediaDto.isPublic !== undefined && { is_public: updateMediaDto.isPublic }),
      })
      .eq('id', mediaId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to update media');
    }

    return {
      message: 'Media updated successfully',
      media: data,
    };
  }

  async deleteMedia(mediaId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: existingMedia } = await supabase
      .from('media')
      .select('uploaded_by, file_path')
      .eq('id', mediaId)
      .single();

    if (!existingMedia) {
      throw new NotFoundException('Media not found');
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isUploader = existingMedia.uploaded_by === userId;
    const isAdmin = userProfile?.role === 'admin';

    if (!isUploader && !isAdmin) {
      throw new ForbiddenException('You can only delete your own media');
    }

    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId);

    if (dbError) {
      throw new BadRequestException('Failed to delete media record');
    }

    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([existingMedia.file_path]);

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
    }

    return { message: 'Media deleted successfully' };
  }

  async getMyMedia(userId: string, limit = 20, offset = 0) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('media')
      .select('id, title, description, file_path, file_type, file_size, is_public, created_at')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException('Failed to fetch your media');
    }

    return data.map(media => ({
      id: media.id,
      title: media.title,
      description: media.description,
      filePath: media.file_path,
      fileType: media.file_type,
      fileSize: media.file_size,
      isPublic: media.is_public,
      createdAt: media.created_at,
    }));
  }

  async getAllMedia(limit = 20, offset = 0) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('media')
      .select(`
        id,
        title,
        description,
        file_path,
        file_type,
        file_size,
        is_public,
        created_at,
        profiles!media_uploaded_by_fkey (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException('Failed to fetch media');
    }

    return data.map(media => ({
      id: media.id,
      title: media.title,
      description: media.description,
      filePath: media.file_path,
      fileType: media.file_type,
      fileSize: media.file_size,
      isPublic: media.is_public,
      createdAt: media.created_at,
      uploader: media.profiles ? {
        firstName: (media.profiles as any)?.first_name,
        lastName: (media.profiles as any)?.last_name,
      } : null,
    }));
  }
}