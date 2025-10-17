import { TeachersService } from './teachers.service';
import { TeacherApplicationDto } from './dto/teacher-application.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
export declare class TeachersController {
    private teachersService;
    constructor(teachersService: TeachersService);
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
    getMyTeacherProfile(req: any): Promise<{
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
    applyAsTeacher(req: any, applicationDto: TeacherApplicationDto): Promise<{
        message: string;
        teacher: any;
    }>;
    updateTeacherProfile(req: any, updateDto: UpdateTeacherDto): Promise<{
        message: string;
        teacher: any;
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
    verifyTeacher(teacherId: string, req: any): Promise<{
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
    getTeacherById(teacherId: string): Promise<{
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
    }>;
}
