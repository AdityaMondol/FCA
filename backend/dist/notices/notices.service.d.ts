import { SupabaseService } from '../supabase/supabase.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
export declare class NoticesService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    getPublishedNotices(language?: 'bn' | 'en', limit?: number, offset?: number): Promise<{
        id: any;
        title: any;
        body: any;
        language: any;
        createdAt: any;
        updatedAt: any;
        author: {
            firstName: any;
            lastName: any;
        };
    }[]>;
    getNoticeById(id: string): Promise<{
        id: any;
        title: any;
        body: any;
        language: any;
        isPublished: any;
        createdAt: any;
        updatedAt: any;
        author: {
            firstName: any;
            lastName: any;
        };
    }>;
    createNotice(authorId: string, createNoticeDto: CreateNoticeDto): Promise<{
        message: string;
        notice: any;
    }>;
    updateNotice(noticeId: string, authorId: string, updateNoticeDto: UpdateNoticeDto): Promise<{
        message: string;
        notice: any;
    }>;
    deleteNotice(noticeId: string, authorId: string): Promise<{
        message: string;
    }>;
    getMyNotices(authorId: string, limit?: number, offset?: number): Promise<{
        id: any;
        title: any;
        body: any;
        language: any;
        isPublished: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    getAllNotices(limit?: number, offset?: number): Promise<{
        id: any;
        title: any;
        body: any;
        language: any;
        isPublished: any;
        createdAt: any;
        updatedAt: any;
        author: {
            firstName: any;
            lastName: any;
        };
    }[]>;
}
