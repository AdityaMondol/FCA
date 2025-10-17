import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { TeacherApplicationDto } from './dto/teacher-application.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Controller('teachers')
export class TeachersController {
  constructor(private teachersService: TeachersService) {}

  @Get()
  async getAllVerifiedTeachers() {
    return this.teachersService.getAllVerifiedTeachers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyTeacherProfile(@Request() req) {
    return this.teachersService.getTeacherByProfileId(req.user.profileId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['teacher'])
  @Post('apply')
  @HttpCode(HttpStatus.CREATED)
  async applyAsTeacher(@Request() req, @Body() applicationDto: TeacherApplicationDto) {
    return this.teachersService.applyAsTeacher(req.user.profileId, applicationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['teacher'])
  @Put('profile')
  async updateTeacherProfile(@Request() req, @Body() updateDto: UpdateTeacherDto) {
    return this.teachersService.updateTeacherProfile(req.user.profileId, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Get('pending')
  async getPendingTeachers() {
    return this.teachersService.getPendingTeachers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Put(':id/verify')
  async verifyTeacher(@Param('id') teacherId: string, @Request() req) {
    return this.teachersService.verifyTeacher(teacherId, req.user.profileId);
  }

  @Get(':id')
  async getTeacherById(@Param('id') teacherId: string) {
    // This endpoint returns public teacher information for verified teachers only
    const teachers = await this.teachersService.getAllVerifiedTeachers();
    const teacher = teachers.find(t => t.id === teacherId);
    
    if (!teacher) {
      throw new Error('Teacher not found or not verified');
    }
    
    return teacher;
  }
}