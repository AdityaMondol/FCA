import { IsEmail, IsString, IsOptional, IsIn, MinLength, Matches, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  password: string;

  @IsString()
  @MinLength(6, { message: 'Password confirmation must be at least 6 characters long' })
  confirmPassword: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+8801|01)[3-9]\d{8}$/, {
    message: 'Phone number must be a valid Bangladeshi mobile number (e.g., 01712345678)'
  })
  phone?: string;

  @IsString()
  @IsIn(['student', 'guardian', 'teacher'], {
    message: 'Role must be either student, guardian, or teacher'
  })
  role: 'student' | 'guardian' | 'teacher';

  @ValidateIf(o => o.role === 'teacher')
  @IsString({ message: 'Teacher code is required for teacher registration' })
  teacherCode?: string;
}