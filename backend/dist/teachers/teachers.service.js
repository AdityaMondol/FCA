"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let TeachersService = class TeachersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
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
            throw new common_1.BadRequestException('Failed to fetch teachers');
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
    async getTeacherByProfileId(profileId) {
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
            throw new common_1.NotFoundException('Teacher record not found');
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
    async applyAsTeacher(profileId, applicationDto) {
        const supabase = this.supabaseService.getClient();
        const { data: existingTeacher } = await supabase
            .from('teachers')
            .select('id, verified')
            .eq('profile_id', profileId)
            .single();
        if (existingTeacher) {
            if (existingTeacher.verified) {
                throw new common_1.BadRequestException('You are already a verified teacher');
            }
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
                throw new common_1.BadRequestException('Failed to update teacher application');
            }
            return {
                message: 'Teacher application updated successfully',
                teacher: data,
            };
        }
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
            throw new common_1.BadRequestException('Failed to submit teacher application');
        }
        return {
            message: 'Teacher application submitted successfully. Please wait for admin approval.',
            teacher: data,
        };
    }
    async updateTeacherProfile(profileId, updateDto) {
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
            throw new common_1.BadRequestException('Failed to update teacher profile');
        }
        return {
            message: 'Teacher profile updated successfully',
            teacher: data,
        };
    }
    async verifyTeacher(teacherId, adminProfileId) {
        const supabase = this.supabaseService.getClient();
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', adminProfileId)
            .single();
        if (!adminProfile || adminProfile.role !== 'admin') {
            throw new common_1.ForbiddenException('Only administrators can verify teachers');
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
            throw new common_1.BadRequestException('Failed to verify teacher');
        }
        await supabase
            .from('profiles')
            .update({ is_approved: true })
            .eq('id', data.profiles.id);
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
            throw new common_1.BadRequestException('Failed to fetch pending teachers');
        }
        return data.map(teacher => ({
            id: teacher.id,
            bio: teacher.bio,
            subjects: teacher.subjects || [],
            appliedAt: teacher.created_at,
            profile: teacher.profiles,
        }));
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map