import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { NoticesService } from './notices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Controller('notices')
export class NoticesController {
  constructor(private noticesService: NoticesService) {}

  @Get()
  async getPublishedNotices(
    @Query('language') language?: 'bn' | 'en',
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.noticesService.getPublishedNotices(language, limit, offset);
  }

  @Get(':id')
  async getNoticeById(@Param('id') id: string) {
    return this.noticesService.getNoticeById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin', 'teacher'])
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotice(@Request() req, @Body() createNoticeDto: CreateNoticeDto) {
    return this.noticesService.createNotice(req.user.profileId, createNoticeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin', 'teacher'])
  @Put(':id')
  async updateNotice(
    @Param('id') id: string,
    @Request() req,
    @Body() updateNoticeDto: UpdateNoticeDto
  ) {
    return this.noticesService.updateNotice(id, req.user.profileId, updateNoticeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin', 'teacher'])
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotice(@Param('id') id: string, @Request() req) {
    return this.noticesService.deleteNotice(id, req.user.profileId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin', 'teacher'])
  @Get('my/notices')
  async getMyNotices(
    @Request() req,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.noticesService.getMyNotices(req.user.profileId, limit, offset);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Get('admin/all')
  async getAllNotices(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.noticesService.getAllNotices(limit, offset);
  }
}