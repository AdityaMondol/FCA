import { SupabaseService } from '../supabase/supabase.service';
import { TeacherApplicationDto } from './dto/teacher-application.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
export declare class TeachersService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    getAllVerifiedTeachers(): Promise<{
        id: any;
        bio: any;
        subjects: any;
        verificationDate: any;
        createdAt: any;
        profile: {
            id: any;
            first_name: any;
            last_name: any;
            email: any;
            phone: any;
        }[];
    }[]>;
    getTeacherByProfileId(profileId: string): Promise<{
        id: any;
        verified: any;
        bio: any;
        subjects: any;
        verificationDate: any;
        createdAt: any;
        updatedAt: any;
        profile: {
            id: any;
            first_name: any;
            last_name: any;
            email: any;
            phone: any;
            role: any;
        }[];
    }>;
    applyAsTeacher(profileId: string, applicationDto: TeacherApplicationDto): Promise<{
        message: string;
        teacher: any;
    }>;
    updateTeacherProfile(profileId: string, updateDto: UpdateTeacherDto): Promise<{
        message: string;
        teacher: any;
    }>;
    verifyTeacher(teacherId: string, adminProfileId: string): Promise<{
        message: string;
        teacher: {
            id: any;
            verified: any;
            verification_date: any;
            profiles: {
                id: any;
                first_name: any;
                last_name: any;
                email: any;
            }[];
        };
    }>;
    getPendingTeachers(): Promise<{
        id: any;
        bio: any;
        subjects: any;
        appliedAt: any;
        profile: {
            id: any;
            first_name: any;
            last_name: any;
            email: any;
            phone: any;
            created_at: any;
        }[];
    }[]>;
}
