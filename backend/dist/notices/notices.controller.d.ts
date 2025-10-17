import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
export declare class NoticesController {
    private noticesService;
    constructor(noticesService: NoticesService);
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
    createNotice(req: any, createNoticeDto: CreateNoticeDto): Promise<{
        message: string;
        notice: any;
    }>;
    updateNotice(id: string, req: any, updateNoticeDto: UpdateNoticeDto): Promise<{
        message: string;
        notice: any;
    }>;
    deleteNotice(id: string, req: any): Promise<{
        message: string;
    }>;
    getMyNotices(req: any, limit?: number, offset?: number): Promise<{
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
