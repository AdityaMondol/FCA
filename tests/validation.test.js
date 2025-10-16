const { validate, sanitizeInput, validateEmail, validatePassword } = require('../utils/validate');

describe('Input Validation', () => {
  describe('Email Validation', () => {
    it('should validate correct email format', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result).toBe(true);
      });
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user @example.com'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MyPassword@2024',
        'Secure#Pass99'
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'weak',
        '12345678',
        'password',
        'Pass123',
        'NoSpecialChar123'
      ];

      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result).toBe(false);
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should remove XSS attempts', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const sanitized = sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should remove SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const sanitized = sanitizeInput(sqlInjection);
      
      expect(sanitized).not.toContain('DROP TABLE');
    });

    it('should preserve legitimate input', () => {
      const legitimateInput = 'This is a normal user input';
      const sanitized = sanitizeInput(legitimateInput);
      
      expect(sanitized).toBe(legitimateInput);
    });

    it('should handle object sanitization', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        malicious: '<script>alert("xss")</script>'
      };

      const sanitized = sanitizeInput(input);
      
      expect(sanitized.name).toBe('John Doe');
      expect(sanitized.email).toBe('john@example.com');
      expect(sanitized.malicious).not.toContain('<script>');
    });

    it('should handle array sanitization', () => {
      const input = [
        'normal text',
        '<img src=x onerror="alert(1)">',
        'another normal text'
      ];

      const sanitized = sanitizeInput(input);
      
      expect(sanitized[0]).toBe('normal text');
      expect(sanitized[1]).not.toContain('onerror');
      expect(sanitized[2]).toBe('another normal text');
    });
  });

  describe('Schema Validation', () => {
    it('should validate user registration schema', async () => {
      const validData = {
        email: 'user@example.com',
        password: 'ValidPass123!',
        name: 'John Doe',
        role: 'student'
      };

      const result = await validate(validData, 'userRegistration');
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid registration data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        name: '',
        role: 'invalid-role'
      };

      const result = await validate(invalidData, 'userRegistration');
      expect(result.error).toBeDefined();
    });

    it('should validate notice creation schema', async () => {
      const validData = {
        title: 'Important Notice',
        content: 'This is an important notice',
        category: 'general'
      };

      const result = await validate(validData, 'noticeCreation');
      expect(result.error).toBeUndefined();
    });

    it('should validate media upload schema', async () => {
      const validData = {
        fileName: 'image.jpg',
        fileSize: 1024000,
        fileType: 'image/jpeg',
        category: 'gallery'
      };

      const result = await validate(validData, 'mediaUpload');
      expect(result.error).toBeUndefined();
    });
  });
});
