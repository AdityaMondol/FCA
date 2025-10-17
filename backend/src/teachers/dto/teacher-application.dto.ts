import { IsString, IsArray, IsOptional, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Transform } from 'class-transformer';

export class TeacherApplicationDto {
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Bio must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  bio?: string;

  @IsArray({ message: 'Subjects must be an array' })
  @ArrayMinSize(1, { message: 'At least one subject is required' })
  @ArrayMaxSize(10, { message: 'Maximum 10 subjects allowed' })
  @IsString({ each: true, message: 'Each subject must be a string' })
  @Transform(({ value }) => 
    Array.isArray(value) 
      ? value.map(subject => subject?.trim()).filter(Boolean)
      : []
  )
  subjects: string[];
}