const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Get security settings and logs
// @route   GET /api/security
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    // Get user's security settings from preferences
    const user = await db('users')
      .select('preferences', 'email_verified', 'two_factor_enabled')
      .where({ id: req.user.id })
      .first();

    const preferences = user?.preferences ? JSON.parse(user.preferences) : {};
    const securitySettings = preferences.security || getDefaultSecuritySettings();

    // Get recent security logs
    const recentLogs = await db('security_logs')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc')
      .limit(10);

    // Get active sessions
    const activeSessions = await db('sessions')
      .where({ user_id: req.user.id })
      .andWhere('expires_at', '>', new Date())
      .orderBy('created_at', 'desc');

    res.status(200).json({
      success: true,
      data: {
        settings: {
          ...securitySettings,
          email_verified: user?.email_verified || false,
          two_factor_enabled: user?.two_factor_enabled || false,
        },
        recent_logs: recentLogs,
        active_sessions: activeSessions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Change password
// @route   PUT /api/security/password
// @access  Private
router.put('/password', protect, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
      });
    }

    // Get current user
    const user = await db('users').select('password').where({ id: req.user.id }).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
    if (!isCurrentPasswordValid) {
      await logSecurityEvent(
        req.user.id,
        'password_change_failed',
        'authentication',
        'warning',
        {
          reason: 'invalid_current_password',
        },
        req,
      );

      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Validate new password
    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long',
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await db('users').where({ id: req.user.id }).update({
      password: hashedPassword,
      updated_at: new Date(),
    });

    // Log security event
    await logSecurityEvent(
      req.user.id,
      'password_changed',
      'authentication',
      'info',
      {
        password_changed_at: new Date(),
      },
      req,
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Enable/disable two-factor authentication
// @route   PUT /api/security/two-factor
// @access  Private
router.put('/two-factor', protect, async (req, res, next) => {
  try {
    const { enabled, verification_code } = req.body;

    if (enabled === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Enabled status is required',
      });
    }

    if (enabled && !verification_code) {
      // Generate 2FA secret (in a real app, you'd use a proper 2FA library)
      const twoFactorSecret = generateTwoFactorSecret();

      // Store temporary secret for verification
      await db('users').where({ id: req.user.id }).update({
        two_factor_secret: twoFactorSecret,
        updated_at: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication setup initiated',
        data: {
          secret: twoFactorSecret,
          qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`otpauth://totp/Aspora:${req.user.email}?secret=${twoFactorSecret}&issuer=Aspora`)}`,
        },
      });
    }

    if (enabled && verification_code) {
      // Verify the code (simplified - in real app use proper 2FA library)
      const user = await db('users').select('two_factor_secret').where({ id: req.user.id }).first();

      if (!user.two_factor_secret) {
        return res.status(400).json({
          success: false,
          error: 'No two-factor secret found. Please start the setup process again.',
        });
      }

      // In a real app, verify the TOTP code here
      const isValidCode = verifyTwoFactorCode(user.two_factor_secret, verification_code);

      if (!isValidCode) {
        await logSecurityEvent(
          req.user.id,
          'two_factor_verification_failed',
          'authentication',
          'warning',
          {
            reason: 'invalid_verification_code',
          },
          req,
        );

        return res.status(400).json({
          success: false,
          error: 'Invalid verification code',
        });
      }

      // Enable 2FA
      await db('users').where({ id: req.user.id }).update({
        two_factor_enabled: true,
        two_factor_secret: user.two_factor_secret, // Keep the secret
        updated_at: new Date(),
      });

      await logSecurityEvent(
        req.user.id,
        'two_factor_enabled',
        'authentication',
        'info',
        {
          enabled_at: new Date(),
        },
        req,
      );

      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication enabled successfully',
      });
    }

    if (!enabled) {
      // Disable 2FA
      await db('users').where({ id: req.user.id }).update({
        two_factor_enabled: false,
        two_factor_secret: null,
        updated_at: new Date(),
      });

      await logSecurityEvent(
        req.user.id,
        'two_factor_disabled',
        'authentication',
        'info',
        {
          disabled_at: new Date(),
        },
        req,
      );

      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication disabled successfully',
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get security logs
// @route   GET /api/security/logs
// @access  Private
router.get('/logs', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, event_type, severity, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let query = db('security_logs').where({ user_id: req.user.id });

    if (event_type) {
      query = query.where('event_type', event_type);
    }

    if (severity) {
      query = query.where('severity', severity);
    }

    if (start_date) {
      query = query.where('created_at', '>=', new Date(start_date));
    }

    if (end_date) {
      query = query.where('created_at', '<=', new Date(end_date));
    }

    const logs = await query.orderBy('created_at', 'desc').limit(parseInt(limit)).offset(offset);

    const totalCount = await db('security_logs')
      .where({ user_id: req.user.id })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: logs.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get active sessions
// @route   GET /api/security/sessions
// @access  Private
router.get('/sessions', protect, async (req, res, next) => {
  try {
    const sessions = await db('sessions')
      .where({ user_id: req.user.id })
      .andWhere('expires_at', '>', new Date())
      .orderBy('created_at', 'desc');

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Revoke session
// @route   DELETE /api/security/sessions/:id
// @access  Private
router.delete('/sessions/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await db('sessions').where({ id, user_id: req.user.id }).first();

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    await db('sessions').where({ id }).update({
      expires_at: new Date(),
      updated_at: new Date(),
    });

    await logSecurityEvent(
      req.user.id,
      'session_revoked',
      'authentication',
      'info',
      {
        session_id: id,
        revoked_at: new Date(),
      },
      req,
    );

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Revoke all other sessions
// @route   DELETE /api/security/sessions
// @access  Private
router.delete('/sessions', protect, async (req, res, next) => {
  try {
    const currentSessionId = req.sessionID || req.headers['x-session-id'];

    await db('sessions')
      .where({ user_id: req.user.id })
      .andWhere('id', '!=', currentSessionId)
      .update({
        expires_at: new Date(),
        updated_at: new Date(),
      });

    await logSecurityEvent(
      req.user.id,
      'all_sessions_revoked',
      'authentication',
      'info',
      {
        revoked_at: new Date(),
        current_session_preserved: true,
      },
      req,
    );

    res.status(200).json({
      success: true,
      message: 'All other sessions revoked successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update security settings
// @route   PUT /api/security/settings
// @access  Private
router.put('/settings', protect, async (req, res, next) => {
  try {
    const {
      login_notifications,
      suspicious_activity_alerts,
      data_export_frequency,
      account_deletion_delay,
    } = req.body;

    // Get current preferences
    const user = await db('users').select('preferences').where({ id: req.user.id }).first();

    const currentPreferences = user?.preferences ? JSON.parse(user.preferences) : {};
    const currentSecuritySettings = currentPreferences.security || getDefaultSecuritySettings();

    const updatedSecuritySettings = {
      ...currentSecuritySettings,
      login_notifications:
        login_notifications !== undefined
          ? login_notifications
          : currentSecuritySettings.login_notifications,
      suspicious_activity_alerts:
        suspicious_activity_alerts !== undefined
          ? suspicious_activity_alerts
          : currentSecuritySettings.suspicious_activity_alerts,
      data_export_frequency: data_export_frequency || currentSecuritySettings.data_export_frequency,
      account_deletion_delay:
        account_deletion_delay || currentSecuritySettings.account_deletion_delay,
    };

    const updatedPreferences = {
      ...currentPreferences,
      security: updatedSecuritySettings,
    };

    await db('users')
      .where({ id: req.user.id })
      .update({
        preferences: JSON.stringify(updatedPreferences),
        updated_at: new Date(),
      });

    res.status(200).json({
      success: true,
      message: 'Security settings updated successfully',
      data: updatedSecuritySettings,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Request account deletion
// @route   POST /api/security/delete-account
// @access  Private
router.post('/delete-account', protect, async (req, res, next) => {
  try {
    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required to delete account',
      });
    }

    // Verify password
    const user = await db('users').select('password').where({ id: req.user.id }).first();

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logSecurityEvent(
        req.user.id,
        'account_deletion_failed',
        'authentication',
        'warning',
        {
          reason: 'invalid_password',
        },
        req,
      );

      return res.status(400).json({
        success: false,
        error: 'Invalid password',
      });
    }

    // Schedule account deletion (in a real app, you'd use a job queue)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30); // 30 days delay

    await db('users').where({ id: req.user.id }).update({
      deletion_scheduled_at: deletionDate,
      deletion_reason: reason,
      updated_at: new Date(),
    });

    await logSecurityEvent(
      req.user.id,
      'account_deletion_scheduled',
      'authentication',
      'critical',
      {
        deletion_scheduled_at: deletionDate,
        reason: reason,
      },
      req,
    );

    res.status(200).json({
      success: true,
      message: 'Account deletion scheduled. You have 30 days to cancel.',
      data: {
        deletion_date: deletionDate,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel account deletion
// @route   DELETE /api/security/delete-account
// @access  Private
router.delete('/delete-account', protect, async (req, res, next) => {
  try {
    await db('users').where({ id: req.user.id }).update({
      deletion_scheduled_at: null,
      deletion_reason: null,
      updated_at: new Date(),
    });

    await logSecurityEvent(
      req.user.id,
      'account_deletion_cancelled',
      'authentication',
      'info',
      {
        cancelled_at: new Date(),
      },
      req,
    );

    res.status(200).json({
      success: true,
      message: 'Account deletion cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function logSecurityEvent(userId, eventType, category, severity, metadata, req) {
  try {
    await db('security_logs').insert({
      user_id: userId,
      event_type: eventType,
      event_category: category,
      severity: severity,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      metadata: JSON.stringify(metadata),
      description: getEventDescription(eventType),
      created_at: new Date(),
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

function getEventDescription(eventType) {
  const descriptions = {
    password_changed: 'Password was changed successfully',
    password_change_failed: 'Failed password change attempt',
    two_factor_enabled: 'Two-factor authentication was enabled',
    two_factor_disabled: 'Two-factor authentication was disabled',
    two_factor_verification_failed: 'Failed two-factor authentication verification',
    session_revoked: 'User session was revoked',
    all_sessions_revoked: 'All user sessions were revoked',
    account_deletion_scheduled: 'Account deletion was scheduled',
    account_deletion_cancelled: 'Account deletion was cancelled',
    account_deletion_failed: 'Failed account deletion attempt',
  };

  return descriptions[eventType] || 'Security event occurred';
}

function getDefaultSecuritySettings() {
  return {
    login_notifications: true,
    suspicious_activity_alerts: true,
    data_export_frequency: 'monthly',
    account_deletion_delay: 30,
  };
}

function generateTwoFactorSecret() {
  // In a real app, use a proper 2FA library like speakeasy
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function verifyTwoFactorCode(secret, code) {
  // In a real app, use a proper 2FA library to verify TOTP codes
  // This is a simplified mock implementation
  return code.length === 6 && /^\d+$/.test(code);
}

module.exports = router;
