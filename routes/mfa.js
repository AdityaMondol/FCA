const express = require('express');
const { mfaManager } = require('../utils/mfa');
const { verifyToken } = require('../utils/auth');
const { logger } = require('../utils/log');
const { cacheManager } = require('../utils/cache');

const router = express.Router();

// Middleware to verify user is authenticated
const requireAuth = verifyToken;

// Generate MFA setup
router.post('/setup', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;

    // Check if MFA is already enabled
    if (req.user.mfa_enabled) {
      return res.status(400).json({
        error: 'MFA is already enabled for this account'
      });
    }

    // Generate secret and QR code
    const secretData = mfaManager.generateSecret(email);
    const qrCode = await mfaManager.generateQRCode(secretData.qr_code_url);
    const backupCodes = mfaManager.generateBackupCodes(10);

    // Store temporary MFA setup in cache (expires in 10 minutes)
    const setupData = {
      secret: secretData.secret,
      backupCodes: backupCodes,
      createdAt: new Date(),
      userId
    };

    await cacheManager.set(`mfa:setup:${userId}`, setupData, 600);

    mfaManager.auditMFAAction('setup_initiated', userId);

    res.json({
      secret: secretData.secret,
      qrCode,
      backupCodes,
      message: 'Scan the QR code with your authenticator app and enter the 6-digit code to complete setup'
    });
  } catch (error) {
    logger.error('MFA setup error:', error);
    res.status(500).json({
      error: 'Failed to setup MFA'
    });
  }
});

// Verify and enable MFA
router.post('/verify-setup', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token || token.length !== 6) {
      return res.status(400).json({
        error: 'Invalid token format'
      });
    }

    // Get setup data from cache
    const setupData = await cacheManager.get(`mfa:setup:${userId}`);

    if (!setupData) {
      return res.status(400).json({
        error: 'MFA setup session expired. Please start over.'
      });
    }

    // Verify token
    const isValid = mfaManager.verifyToken(setupData.secret, token);

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid token. Please try again.'
      });
    }

    // Hash backup codes
    const hashedBackupCodes = setupData.backupCodes.map(code =>
      mfaManager.hashBackupCode(code)
    );

    // Update user in database (you need to implement this)
    // await supabase
    //   .from('users')
    //   .update({
    //     mfa_enabled: true,
    //     mfa_secret: setupData.secret,
    //     mfa_backup_codes: hashedBackupCodes,
    //     mfa_setup_date: new Date()
    //   })
    //   .eq('id', userId);

    // Clear cache
    await cacheManager.del(`mfa:setup:${userId}`);

    mfaManager.auditMFAAction('mfa_enabled', userId);

    res.json({
      message: 'MFA enabled successfully',
      backupCodes: setupData.backupCodes,
      warning: 'Save these backup codes in a secure location. You will need them if you lose access to your authenticator app.'
    });
  } catch (error) {
    logger.error('MFA verification error:', error);
    res.status(500).json({
      error: 'Failed to verify MFA'
    });
  }
});

// Disable MFA
router.post('/disable', requireAuth, async (req, res) => {
  try {
    const { password, token } = req.body;
    const userId = req.user.id;

    // Verify password
    // const isPasswordValid = await bcrypt.compare(password, req.user.password_hash);
    // if (!isPasswordValid) {
    //   return res.status(401).json({ error: 'Invalid password' });
    // }

    // Verify MFA token
    if (req.user.mfa_enabled) {
      const isValid = mfaManager.verifyToken(req.user.mfa_secret, token);
      if (!isValid) {
        return res.status(400).json({
          error: 'Invalid MFA token'
        });
      }
    }

    // Update user in database
    // await supabase
    //   .from('users')
    //   .update({
    //     mfa_enabled: false,
    //     mfa_secret: null,
    //     mfa_backup_codes: null
    //   })
    //   .eq('id', userId);

    mfaManager.auditMFAAction('mfa_disabled', userId);

    res.json({
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    logger.error('MFA disable error:', error);
    res.status(500).json({
      error: 'Failed to disable MFA'
    });
  }
});

// Verify MFA token during login
router.post('/verify-login', async (req, res) => {
  try {
    const { userId, token, backupCode } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    // Get MFA challenge from cache
    const challenge = await cacheManager.get(`mfa:challenge:${userId}`);

    if (!challenge) {
      return res.status(400).json({
        error: 'MFA challenge not found. Please login again.'
      });
    }

    // Get user from database
    // const { data: user } = await supabase
    //   .from('users')
    //   .select('*')
    //   .eq('id', userId)
    //   .single();

    // if (!user || !user.mfa_enabled) {
    //   return res.status(400).json({ error: 'MFA not enabled' });
    // }

    let isValid = false;

    // Try token first
    if (token) {
      isValid = mfaManager.verifyToken(challenge.secret, token);
    }

    // Try backup code if token fails
    if (!isValid && backupCode) {
      // Check backup codes
      // isValid = user.mfa_backup_codes.some(code =>
      //   mfaManager.verifyBackupCode(backupCode, code)
      // );
    }

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid token or backup code'
      });
    }

    // Clear challenge
    await cacheManager.del(`mfa:challenge:${userId}`);

    // Generate login token
    // const loginToken = jwt.sign({ userId }, process.env.JWT_SECRET);

    mfaManager.auditMFAAction('login_verified', userId);

    res.json({
      message: 'MFA verification successful',
      // token: loginToken
    });
  } catch (error) {
    logger.error('MFA login verification error:', error);
    res.status(500).json({
      error: 'Failed to verify MFA'
    });
  }
});

// Get MFA status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const status = mfaManager.getMFAStatus(req.user);

    res.json({
      enabled: status.enabled,
      setupDate: status.setupDate,
      lastUsed: status.lastUsed
    });
  } catch (error) {
    logger.error('MFA status error:', error);
    res.status(500).json({
      error: 'Failed to get MFA status'
    });
  }
});

// Regenerate backup codes
router.post('/regenerate-backup-codes', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!req.user.mfa_enabled) {
      return res.status(400).json({
        error: 'MFA is not enabled'
      });
    }

    // Verify MFA token
    const isValid = mfaManager.verifyToken(req.user.mfa_secret, token);

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid MFA token'
      });
    }

    // Generate new backup codes
    const newBackupCodes = mfaManager.generateBackupCodes(10);
    const hashedBackupCodes = newBackupCodes.map(code =>
      mfaManager.hashBackupCode(code)
    );

    // Update user in database
    // await supabase
    //   .from('users')
    //   .update({
    //     mfa_backup_codes: hashedBackupCodes
    //   })
    //   .eq('id', userId);

    mfaManager.auditMFAAction('backup_codes_regenerated', userId);

    res.json({
      backupCodes: newBackupCodes,
      message: 'Backup codes regenerated successfully'
    });
  } catch (error) {
    logger.error('Backup codes regeneration error:', error);
    res.status(500).json({
      error: 'Failed to regenerate backup codes'
    });
  }
});

module.exports = router;
