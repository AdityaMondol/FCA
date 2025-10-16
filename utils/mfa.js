const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { logger } = require('./log');

class MFAManager {
  constructor() {
    this.appName = 'Farid Cadet Academy';
    this.issuer = 'FCA';
  }

  // Generate TOTP secret
  generateSecret(email) {
    try {
      const secret = speakeasy.generateSecret({
        name: `${this.appName} (${email})`,
        issuer: this.issuer,
        length: 32
      });

      return {
        secret: secret.base32,
        otpauth_url: secret.otpauth_url,
        qr_code_url: secret.otpauth_url
      };
    } catch (error) {
      logger.error('Failed to generate MFA secret:', error);
      throw error;
    }
  }

  // Generate QR code
  async generateQRCode(otpauthUrl) {
    try {
      const qrCode = await QRCode.toDataURL(otpauthUrl);
      return qrCode;
    } catch (error) {
      logger.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  // Verify TOTP token
  verifyToken(secret, token) {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      return verified;
    } catch (error) {
      logger.error('Failed to verify TOTP token:', error);
      return false;
    }
  }

  // Generate backup codes
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  // Hash backup code
  hashBackupCode(code) {
    return crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
  }

  // Verify backup code
  verifyBackupCode(code, hashedCode) {
    const hash = this.hashBackupCode(code);
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(hashedCode)
    );
  }

  // Generate recovery codes
  generateRecoveryCodes(count = 8) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(6).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Validate MFA setup
  validateMFASetup(secret, token, backupCodes) {
    const errors = [];

    if (!secret || secret.length === 0) {
      errors.push('Secret is required');
    }

    if (!token || token.length !== 6) {
      errors.push('Token must be 6 digits');
    } else if (!this.verifyToken(secret, token)) {
      errors.push('Invalid token');
    }

    if (!Array.isArray(backupCodes) || backupCodes.length === 0) {
      errors.push('Backup codes are required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get MFA status
  getMFAStatus(user) {
    return {
      enabled: !!user.mfa_enabled,
      setupDate: user.mfa_setup_date,
      lastUsed: user.mfa_last_used
    };
  }

  // Disable MFA
  disableMFA(user) {
    return {
      mfa_enabled: false,
      mfa_secret: null,
      mfa_backup_codes: null,
      mfa_setup_date: null
    };
  }

  // Validate MFA requirement
  requiresMFA(user) {
    return user.mfa_enabled === true;
  }

  // Generate MFA challenge
  generateMFAChallenge(userId) {
    const challenge = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    return {
      challenge,
      userId,
      expiresAt,
      attempts: 0,
      maxAttempts: 3
    };
  }

  // Verify MFA challenge
  verifyMFAChallenge(challenge, token, secret) {
    if (!challenge) {
      return {
        valid: false,
        error: 'Challenge not found'
      };
    }

    if (new Date() > challenge.expiresAt) {
      return {
        valid: false,
        error: 'Challenge expired'
      };
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      return {
        valid: false,
        error: 'Maximum attempts exceeded'
      };
    }

    const isValid = this.verifyToken(secret, token);

    if (!isValid) {
      challenge.attempts++;
      return {
        valid: false,
        error: 'Invalid token',
        attemptsRemaining: challenge.maxAttempts - challenge.attempts
      };
    }

    return {
      valid: true,
      userId: challenge.userId
    };
  }

  // Audit MFA action
  auditMFAAction(action, userId, details = {}) {
    logger.info(`MFA_AUDIT: ${action}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
}

const mfaManager = new MFAManager();

module.exports = {
  mfaManager,
  MFAManager
};
