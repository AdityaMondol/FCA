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
exports.NoticesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let NoticesService = class NoticesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getPublishedNotices(language, limit = 20, offset = 0) {
        const supabase = this.supabaseService.getClient();
        let query = supabase
            .from('notices')
            .select(`
        id,
        title,
        body,
        language,
        created_at,
        updated_at,
        profiles!notices_author_id_fkey (
          first_name,
          last_name
        )
      `)
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (language) {
            query = query.eq('language', language);
        }
        const { data, error } = await query;
        if (error) {
            throw new common_1.BadRequestException('Failed to fetch notices');
        }
        return data.map(notice => ({
            id: notice.id,
            title: notice.title,
            body: notice.body,
            language: notice.language,
            createdAt: notice.created_at,
            updatedAt: notice.updated_at,
            author: notice.profiles ? {
                firstName: notice.profiles.first_name,
                lastName: notice.profiles.last_name,
            } : null,
        }));
    }
    async getNoticeById(id) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('notices')
            .select(`
        id,
        title,
        body,
        language,
        is_published,
        created_at,
        updated_at,
        profiles!notices_author_id_fkey (
          first_name,
          last_name
        )
      `)
            .eq('id', id)
            .eq('is_published', true)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Notice not found');
        }
        return {
            id: data.id,
            title: data.title,
            body: data.body,
            language: data.language,
            isPublished: data.is_published,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            author: data.profiles ? {
                firstName: data.profiles.first_name,
                lastName: data.profiles.last_name,
            } : null,
        };
    }
    async createNotice(authorId, createNoticeDto) {
        const supabase = this.supabaseService.getClient();
        const { data: authorProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authorId)
            .single();
        if (!authorProfile || !['admin', 'teacher'].includes(authorProfile.role)) {
            throw new common_1.ForbiddenException('Only administrators and teachers can create notices');
        }
        const { data, error } = await supabase
            .from('notices')
            .insert({
            title: createNoticeDto.title,
            body: createNoticeDto.body,
            language: createNoticeDto.language,
            is_published: createNoticeDto.isPublished ?? false,
            author_id: authorId,
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException('Failed to create notice');
        }
        return {
            message: 'Notice created successfully',
            notice: data,
        };
    }
    async updateNotice(noticeId, authorId, updateNoticeDto) {
        const supabase = this.supabaseService.getClient();
        const { data: existingNotice } = await supabase
            .from('notices')
            .select('author_id, profiles!notices_author_id_fkey(role)')
            .eq('id', noticeId)
            .single();
        if (!existingNotice) {
            throw new common_1.NotFoundException('Notice not found');
        }
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authorId)
            .single();
        const isAuthor = existingNotice.author_id === authorId;
        const isAdmin = userProfile?.role === 'admin';
        if (!isAuthor && !isAdmin) {
            throw new common_1.ForbiddenException('You can only update your own notices');
        }
        const { data, error } = await supabase
            .from('notices')
            .update({
            ...(updateNoticeDto.title && { title: updateNoticeDto.title }),
            ...(updateNoticeDto.body && { body: updateNoticeDto.body }),
            ...(updateNoticeDto.language && { language: updateNoticeDto.language }),
            ...(updateNoticeDto.isPublished !== undefined && { is_published: updateNoticeDto.isPublished }),
        })
            .eq('id', noticeId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException('Failed to update notice');
        }
        return {
            message: 'Notice updated successfully',
            notice: data,
        };
    }
    async deleteNotice(noticeId, authorId) {
        const supabase = this.supabaseService.getClient();
        const { data: existingNotice } = await supabase
            .from('notices')
            .select('author_id')
            .eq('id', noticeId)
            .single();
        if (!existingNotice) {
            throw new common_1.NotFoundException('Notice not found');
        }
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authorId)
            .single();
        const isAuthor = existingNotice.author_id === authorId;
        const isAdmin = userProfile?.role === 'admin';
        if (!isAuthor && !isAdmin) {
            throw new common_1.ForbiddenException('You can only delete your own notices');
        }
        const { error } = await supabase
            .from('notices')
            .delete()
            .eq('id', noticeId);
        if (error) {
            throw new common_1.BadRequestException('Failed to delete notice');
        }
        return { message: 'Notice deleted successfully' };
    }
    async getMyNotices(authorId, limit = 20, offset = 0) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('notices')
            .select('id, title, body, language, is_published, created_at, updated_at')
            .eq('author_id', authorId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new common_1.BadRequestException('Failed to fetch your notices');
        }
        return data.map(notice => ({
            id: notice.id,
            title: notice.title,
            body: notice.body,
            language: notice.language,
            isPublished: notice.is_published,
            createdAt: notice.created_at,
            updatedAt: notice.updated_at,
        }));
    }
    async getAllNotices(limit = 20, offset = 0) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('notices')
            .select(`
        id,
        title,
        body,
        language,
        is_published,
        created_at,
        updated_at,
        profiles!notices_author_id_fkey (
          first_name,
          last_name
        )
      `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new common_1.BadRequestException('Failed to fetch notices');
        }
        return data.map(notice => ({
            id: notice.id,
            title: notice.title,
            body: notice.body,
            language: notice.language,
            isPublished: notice.is_published,
            createdAt: notice.created_at,
            updatedAt: notice.updated_at,
            author: notice.profiles ? {
                firstName: notice.profiles.first_name,
                lastName: notice.profiles.last_name,
            } : null,
        }));
    }
};
exports.NoticesService = NoticesService;
exports.NoticesService = NoticesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], NoticesService);
//# sourceMappingURL=notices.service.js.map