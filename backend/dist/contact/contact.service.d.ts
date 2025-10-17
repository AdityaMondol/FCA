import { SupabaseService } from '../supabase/supabase.service';
import { ContactFormDto } from './dto/contact-form.dto';
export declare class ContactService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    submitContactForm(contactFormDto: ContactFormDto): Promise<{
        message: string;
        submissionId: any;
    }>;
    getContactSubmissions(limit?: number, offset?: number): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        subject: any;
        message: any;
        status: any;
        submittedAt: any;
        respondedAt: any;
    }[]>;
    updateSubmissionStatus(submissionId: string, status: 'pending' | 'responded' | 'resolved'): Promise<{
        message: string;
        submission: any;
    }>;
    getAcademyInfo(): Promise<{
        name: string;
        nameBangla: string;
        motto: string;
        address: {
            english: string;
            bangla: string;
        };
        location: string;
        contactNumbers: string[];
        email: string;
        established: string;
        programs: {
            name: string;
            nameBangla: string;
            description: string;
        }[];
        serviceTypes: {
            name: string;
            nameBangla: string;
            description: string;
        }[];
        achievements: {
            scholarshipExam: {
                year: string;
                result: string;
                ranking: string;
            };
            cadetCollegeAdmissions: {
                year: string;
                students: number;
            }[];
        };
    }>;
}
