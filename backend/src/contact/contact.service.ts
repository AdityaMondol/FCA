import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ContactFormDto } from './dto/contact-form.dto';

@Injectable()
export class ContactService {
  constructor(private supabaseService: SupabaseService) {}

  async submitContactForm(contactFormDto: ContactFormDto) {
    const supabase = this.supabaseService.getClient();

    try {
      // Create contact_submissions table entry
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
        throw new BadRequestException('Failed to submit contact form');
      }

      // Here you could add email notification logic
      // For now, we'll just log the submission
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

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to submit contact form');
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
      throw new BadRequestException('Failed to fetch contact submissions');
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

  async updateSubmissionStatus(submissionId: string, status: 'pending' | 'responded' | 'resolved') {
    const supabase = this.supabaseService.getClient();

    const updateData: any = { status };
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
      throw new BadRequestException('Failed to update submission status');
    }

    return {
      message: 'Submission status updated successfully',
      submission: data,
    };
  }

  async getAcademyInfo() {
    // Return static academy information from fca.md
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
}