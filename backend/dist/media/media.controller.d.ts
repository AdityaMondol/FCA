import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
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
    uploadMedia(req: any, uploadMediaDto: UploadMediaDto, file: any): Promise<{
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
    updateMedia(id: string, req: any, updateMediaDto: UpdateMediaDto): Promise<{
        message: string;
        media: any;
    }>;
    deleteMedia(id: string, req: any): Promise<{
        message: string;
    }>;
    getMyMedia(req: any, limit?: number, offset?: number): Promise<{
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
