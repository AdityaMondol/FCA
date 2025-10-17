import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TeacherApplicationDto } from './dto/teacher-application.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllVerifiedTeachers() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('teachers')
      .select(`
        id,
        bio,
        subjects,
        verification_date,
        created_at,
        profiles!inner (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('verified', true)
      .order('verification_date', { ascending: false });

    if (error) {
      throw new BadRequestException('Failed to fetch teachers');
    }

    return data.map(teacher => ({
      id: teacher.id,
      bio: teacher.bio,
      subjects: teacher.subjects || [],
      verificationDate: teacher.verification_date,
      createdAt: teacher.created_at,
      profile: teacher.profiles,
    }));
  }

  async getTeacherByProfileId(profileId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('teachers')
      .select(`
        id,
        verified,
        bio,
        subjects,
        verification_date,
        created_at,
        updated_at,
        profiles!inner (
          id,
          first_name,
          last_name,
          email,
          phone,
          role
        )
      `)
      .eq('profile_id', profileId)
      .single();

    if (error) {
      throw new NotFoundException('Teacher record not found');
    }

    return {
      id: data.id,
      verified: data.verified,
      bio: data.bio,
      subjects: data.subjects || [],
      verificationDate: data.verification_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      profile: data.profiles,
    };
  }

  async applyAsTeacher(profileId: string, applicationDto: TeacherApplicationDto) {
    const supabase = this.supabaseService.getClient();

    // Check if teacher record already exists
    const { data: existingTeacher } = await supabase
      .from('teachers')
      .select('id, verified')
      .eq('profile_id', profileId)
      .single();

    if (existingTeacher) {
      if (existingTeacher.verified) {
        throw new BadRequestException('You are already a verified teacher');
      }
      
      // Update existing application
      const { data, error } = await supabase
        .from('teachers')
        .update({
          bio: applicationDto.bio,
          subjects: applicationDto.subjects,
        })
        .eq('profile_id', profileId)
        .select()
        .single();

      if (error) {
        throw new BadRequestException('Failed to update teacher application');
      }

      return {
        message: 'Teacher application updated successfully',
        teacher: data,
      };
    }

    // Create new teacher application
    const { data, error } = await supabase
      .from('teachers')
      .insert({
        profile_id: profileId,
        bio: applicationDto.bio,
        subjects: applicationDto.subjects,
        verified: false,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to submit teacher application');
    }

    return {
      message: 'Teacher application submitted successfully. Please wait for admin approval.',
      teacher: data,
    };
  }

  async updateTeacherProfile(profileId: string, updateDto: UpdateTeacherDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('teachers')
      .update({
        bio: updateDto.bio,
        subjects: updateDto.subjects,
      })
      .eq('profile_id', profileId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to update teacher profile');
    }

    return {
      message: 'Teacher profile updated successfully',
      teacher: data,
    };
  }

  async verifyTeacher(teacherId: string, adminProfileId: string) {
    const supabase = this.supabaseService.getClient();

    // Check if the admin exists and has admin role
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminProfileId)
      .single();

    if (!adminProfile || adminProfile.role !== 'admin') {
      throw new ForbiddenException('Only administrators can verify teachers');
    }

    const { data, error } = await supabase
      .from('teachers')
      .update({
        verified: true,
        verification_date: new Date().toISOString(),
      })
      .eq('id', teacherId)
      .select(`
        id,
        verified,
        verification_date,
        profiles!inner (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException('Failed to verify teacher');
    }

    // Also update the profile to approved
    await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', (data.profiles as any).id);

    return {
      message: 'Teacher verified successfully',
      teacher: data,
    };
  }

  async getPendingTeachers() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('teachers')
      .select(`
        id,
        bio,
        subjects,
        created_at,
        profiles!inner (
          id,
          first_name,
          last_name,
          email,
          phone,
          created_at
        )
      `)
      .eq('verified', false)
      .order('created_at', { ascending: true });

    if (error) {
      throw new BadRequestException('Failed to fetch pending teachers');
    }

    return data.map(teacher => ({
      id: teacher.id,
      bio: teacher.bio,
      subjects: teacher.subjects || [],
      appliedAt: teacher.created_at,
      profile: teacher.profiles,
    }));
  }
}