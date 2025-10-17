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
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let ContactService = class ContactService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async submitContactForm(contactFormDto) {
        const supabase = this.supabaseService.getClient();
        try {
            const { data, error } = await supabase
                .from('contact_submissions')
                .insert({
                name: contactFormDto.name,
                email: contactFormDto.email,
                phone: contactFormDto.phone,
                subject: contactFormDto.subject,
                message: contactFormDto.message,
                status: 'pending',
                submitted_at: new Date().toISOString(),
            })
                .select()
                .single();
            if (error) {
                console.error('Contact form submission error:', error);
                throw new common_1.BadRequestException('Failed to submit contact form');
            }
            console.log('Contact form submitted:', {
                id: data.id,
                name: contactFormDto.name,
                email: contactFormDto.email,
                subject: contactFormDto.subject,
            });
            return {
                message: 'Your message has been sent successfully! We will get back to you soon.',
                submissionId: data.id,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to submit contact form');
        }
    }
    async getContactSubmissions(limit = 20, offset = 0) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('submitted_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new common_1.BadRequestException('Failed to fetch contact submissions');
        }
        return data.map(submission => ({
            id: submission.id,
            name: submission.name,
            email: submission.email,
            phone: submission.phone,
            subject: submission.subject,
            message: submission.message,
            status: submission.status,
            submittedAt: submission.submitted_at,
            respondedAt: submission.responded_at,
        }));
    }
    async updateSubmissionStatus(submissionId, status) {
        const supabase = this.supabaseService.getClient();
        const updateData = { status };
        if (status === 'responded' || status === 'resolved') {
            updateData.responded_at = new Date().toISOString();
        }
        const { data, error } = await supabase
            .from('contact_submissions')
            .update(updateData)
            .eq('id', submissionId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException('Failed to update submission status');
        }
        return {
            message: 'Submission status updated successfully',
            submission: data,
        };
    }
    async getAcademyInfo() {
        return {
            name: 'Farid Cadet Academy',
            nameBangla: 'ফরিদ ক্যাডেট একাডেমি',
            motto: 'LEARN, PREPARE, SUCCEED',
            address: {
                english: 'Mymensingh Road, Palashatoli, Tangail',
                bangla: 'ময়মনসিংহ রোড, পলাশতলী, টাঙ্গাইল',
            },
            location: 'Tangail, Dhaka Division, Bangladesh',
            contactNumbers: [
                '0196-333337',
                '01724-264777',
                '0198-005332'
            ],
            email: 'info@faridcadetacademy.com',
            established: '2020',
            programs: [
                {
                    name: 'Cadet College Admission Special Batch',
                    nameBangla: 'ক্যাডেট কলেজে ভর্তির স্পেশাল ব্যাচ',
                    description: 'Focused on intensive preparation for admission into Cadet Colleges'
                },
                {
                    name: 'Class 5 Scholarship Special Batch',
                    nameBangla: '৫ম শ্রেণি বৃত্তি স্পেশাল ব্যাচ',
                    description: 'Targeted training for high-level scholarship examinations'
                },
                {
                    name: 'Academic Coaching',
                    nameBangla: 'একাডেমিক কোচিং',
                    description: 'General academic support and coaching for students from Class 5 to Class 8'
                }
            ],
            serviceTypes: [
                {
                    name: 'Residential',
                    nameBangla: 'আবাসিক',
                    description: 'Full-time boarding facilities'
                },
                {
                    name: 'Non-Residential',
                    nameBangla: 'অনাবাসিক',
                    description: 'Standard day-time attendance'
                },
                {
                    name: 'Day-Care',
                    nameBangla: 'ডে-কেয়ার',
                    description: 'Extended day supervision and academic support'
                },
                {
                    name: 'Night-Care',
                    nameBangla: 'নাইট কেয়ার',
                    description: 'Evening supervision and study support'
                }
            ],
            achievements: {
                scholarshipExam: {
                    year: '2022/2023',
                    result: '14 scholarship recipients out of 18 examinees',
                    ranking: '1st position in Delduar Upazila'
                },
                cadetCollegeAdmissions: [
                    { year: '2021', students: 3 },
                    { year: '2022', students: 6 }
                ]
            }
        };
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ContactService);
//# sourceMappingURL=contact.service.js.map