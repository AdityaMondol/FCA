import { IsString, IsOptional, IsBoolean, IsIn, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateNoticeDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Body must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Body must not exceed 5000 characters' })
  @Transform(({ value }) => value?.trim())
  body?: string;

  @IsOptional()
  @IsString()
  @IsIn(['bn', 'en'], { message: 'Language must be either "bn" or "en"' })
  language?: 'bn' | 'en';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  isPublished?: boolean;
}