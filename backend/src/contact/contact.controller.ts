import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { ContactFormDto } from './dto/contact-form.dto';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  async submitContactForm(@Body() contactFormDto: ContactFormDto) {
    return this.contactService.submitContactForm(contactFormDto);
  }

  @Get('info')
  async getAcademyInfo() {
    return this.contactService.getAcademyInfo();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Get('submissions')
  async getContactSubmissions(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.contactService.getContactSubmissions(limit, offset);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Put('submissions/:id/status')
  async updateSubmissionStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'responded' | 'resolved'
  ) {
    return this.contactService.updateSubmissionStatus(id, status);
  }
}