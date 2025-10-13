const { validator } = require('../utils/validate');

describe('validator', () => {
  describe('isEmail', () => {
    it('should return true for valid emails', () => {
      expect(validator.isEmail('test@example.com')).toBe(true);
      expect(validator.isEmail('test.name@example.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validator.isEmail('test@example')).toBe(false);
      expect(validator.isEmail('test@.com')).toBe(false);
      expect(validator.isEmail('test')).toBe(false);
    });
  });

  describe('isPhoneNumber', () => {
    it('should return true for valid phone numbers', () => {
      expect(validator.isPhoneNumber('01712345678')).toBe(true);
      expect(validator.isPhoneNumber('+8801712345678')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(validator.isPhoneNumber('12345678')).toBe(false);
      expect(validator.isPhoneNumber('0171234567')).toBe(false);
      expect(validator.isPhoneNumber('012345678901')).toBe(false);
    });
  });

  describe('isName', () => {
    it('should return true for valid names', () => {
      expect(validator.isName('John Doe')).toBe(true);
      expect(validator.isName('John-Doe')).toBe(true);
    });

    it('should return false for invalid names', () => {
      expect(validator.isName('J')).toBe(false);
      expect(validator.isName('John Doe!')).toBe(false);
      expect(validator.isName('John_Doe')).toBe(false);
    });
  });

  describe('isPassword', () => {
    it('should return true for valid passwords', () => {
      expect(validator.isPassword('Password123')).toBe(true);
      expect(validator.isPassword('aB1@$!%*?&')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(validator.isPassword('password')).toBe(false);
      expect(validator.isPassword('Password')).toBe(false);
      expect(validator.isPassword('12345678')).toBe(false);
      expect(validator.isPassword('short')).toBe(false);
    });
  });

  describe('isTeacherCode', () => {
    it('should return true for valid teacher codes', () => {
      expect(validator.isTeacherCode('ABCDEF')).toBe(true);
      expect(validator.isTeacherCode('ABC123DEF')).toBe(true);
    });

    it('should return false for invalid teacher codes', () => {
      expect(validator.isTeacherCode('abc')).toBe(false);
      expect(validator.isTeacherCode('12345')).toBe(false);
      expect(validator.isTeacherCode('ABC-123')).toBe(false);
    });
  });
});
