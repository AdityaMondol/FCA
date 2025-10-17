import { ValidationPipe as NestValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = this.flattenValidationErrors(errors);
        return new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      },
    });
  }

  private flattenValidationErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];
    
    for (const error of errors) {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }
      
      if (error.children && error.children.length > 0) {
        messages.push(...this.flattenValidationErrors(error.children));
      }
    }
    
    return messages;
  }
}