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
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get()
  async getPublicMedia(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.mediaService.getPublicMedia(limit, offset);
  }

  @Get(':id')
  async getMediaById(@Param('id') id: string) {
    return this.mediaService.getMediaById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @Request() req,
    @Body() uploadMediaDto: UploadMediaDto,
    @UploadedFile() file: any
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.mediaService.uploadMedia(req.user.profileId, uploadMediaDto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateMedia(
    @Param('id') id: string,
    @Request() req,
    @Body() updateMediaDto: UpdateMediaDto
  ) {
    return this.mediaService.updateMedia(id, req.user.profileId, updateMediaDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(@Param('id') id: string, @Request() req) {
    return this.mediaService.deleteMedia(id, req.user.profileId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/media')
  async getMyMedia(
    @Request() req,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.mediaService.getMyMedia(req.user.profileId, limit, offset);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Get('admin/all')
  async getAllMedia(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.mediaService.getAllMedia(limit, offset);
  }
}