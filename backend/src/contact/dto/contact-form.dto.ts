import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class ContactFormDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+8801|01)[3-9]\d{8}$/, {
    message: 'Phone number must be a valid Bangladeshi mobile number (e.g., 01712345678)'
  })
  phone?: string;

  @IsString()
  @MinLength(5, { message: 'Subject must be at least 5 characters long' })
  @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  subject: string;

  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters long' })
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  message: string;
}