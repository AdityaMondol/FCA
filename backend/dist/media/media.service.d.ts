import { SupabaseService } from '../supabase/supabase.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    getPublicMedia(limit?: number, offset?: number): Promise<{
        id: any;
        title: any;
        description: any;
        filePath: any;
        fileType: any;
        fileSize: any;
        createdAt: any;
        uploader: {
            firstName: any;
            lastName: any;
        };
    }[]>;
    getMediaById(id: string): Promise<{
        id: any;
        title: any;
        description: any;
        filePath: any;
        fileType: any;
        fileSize: any;
        isPublic: any;
        createdAt: any;
        uploader: {
            firstName: any;
            lastName: any;
        };
    }>;
    uploadMedia(uploaderId: string, uploadMediaDto: UploadMediaDto, file: any): Promise<{
        message: string;
        media: {
            id: any;
            title: any;
            description: any;
            filePath: any;
            fileType: any;
            fileSize: any;
            isPublic: any;
            createdAt: any;
        };
    }>;
    updateMedia(mediaId: string, userId: string, updateMediaDto: UpdateMediaDto): Promise<{
        message: string;
        media: any;
    }>;
    deleteMedia(mediaId: string, userId: string): Promise<{
        message: string;
    }>;
    getMyMedia(userId: string, limit?: number, offset?: number): Promise<{
        id: any;
        title: any;
        description: any;
        filePath: any;
        fileType: any;
        fileSize: any;
        isPublic: any;
        createdAt: any;
    }[]>;
    getAllMedia(limit?: number, offset?: number): Promise<{
        id: any;
        title: any;
        description: any;
        filePath: any;
        fileType: any;
        fileSize: any;
        isPublic: any;
        createdAt: any;
        uploader: {
            firstName: any;
            lastName: any;
        };
    }[]>;
}
