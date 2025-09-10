const express = require('express');
const db = require('../database/connection');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ==================== CERTIFICATE MANAGEMENT ====================

// @desc    Issue certificate
// @route   POST /api/project-certificates/:projectId/issue
// @access  Private
router.post('/:projectId/issue', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      user_id,
      title,
      description,
      type,
      level,
      requirements,
      criteria_met,
      score,
      passing_score,
      expiry_date,
      skills_earned,
      competencies,
      credits_earned
    } = req.body;

    if (!user_id || !title || !type) {
      return res.status(400).json({
        success: false,
        error: 'User ID, title, and type are required'
      });
    }

    // Verify user has permission to issue certificates
    const projectAccess = await db('project_members as pm')
      .select(['pm.role'])
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess || !['admin', 'mentor'].includes(projectAccess.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to issue certificates'
      });
    }

    // Check if user is a member of the project
    const userMembership = await db('project_members')
      .where({ project_id: projectId, user_id, status: 'active' })
      .first();

    if (!userMembership) {
      return res.status(400).json({
        success: false,
        error: 'User is not a member of this project'
      });
    }

    // Check if certificate already exists for this user and type
    const existingCertificate = await db('project_certificates')
      .where({ project_id: projectId, user_id, type })
      .first();

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        error: 'Certificate of this type already exists for this user'
      });
    }

    const verificationCode = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const certificate = await db('project_certificates')
      .insert({
        project_id: projectId,
        user_id,
        issued_by: req.user.id,
        title,
        description,
        type,
        level,
        requirements,
        criteria_met: JSON.stringify(criteria_met),
        score,
        passing_score,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        certificate_number: certificateNumber,
        verification_code: verificationCode,
        skills_earned: JSON.stringify(skills_earned),
        competencies: JSON.stringify(competencies),
        credits_earned
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      data: certificate[0]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update certificate
// @route   PUT /api/project-certificates/:certificateId
// @access  Private
router.put('/:certificateId', protect, async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const updateData = req.body;

    // Verify user has permission to update certificate
    const certificate = await db('project_certificates as pc')
      .select(['pc.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pc.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pc.id', certificateId)
      .first();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    if (certificate.issued_by !== req.user.id && !['admin', 'mentor'].includes(certificate.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update this certificate'
      });
    }

    // Handle JSON fields
    if (updateData.criteria_met) {
      updateData.criteria_met = JSON.stringify(updateData.criteria_met);
    }
    if (updateData.skills_earned) {
      updateData.skills_earned = JSON.stringify(updateData.skills_earned);
    }
    if (updateData.competencies) {
      updateData.competencies = JSON.stringify(updateData.competencies);
    }

    // Handle date fields
    if (updateData.expiry_date) {
      updateData.expiry_date = new Date(updateData.expiry_date);
    }

    updateData.updated_at = new Date();

    await db('project_certificates')
      .where({ id: certificateId })
      .update(updateData);

    const updatedCertificate = await db('project_certificates')
      .where({ id: certificateId })
      .first();

    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data: updatedCertificate
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Revoke certificate
// @route   POST /api/project-certificates/:certificateId/revoke
// @access  Private
router.post('/:certificateId/revoke', protect, async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const { revocation_reason } = req.body;

    // Verify user has permission to revoke certificate
    const certificate = await db('project_certificates as pc')
      .select(['pc.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pc.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pc.id', certificateId)
      .first();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    if (!['admin', 'mentor'].includes(certificate.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to revoke certificates'
      });
    }

    await db('project_certificates')
      .where({ id: certificateId })
      .update({
        status: 'revoked',
        revoked_date: new Date(),
        revocation_reason,
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CERTIFICATE VERIFICATION ====================

// @desc    Verify certificate
// @route   GET /api/project-certificates/verify/:verificationCode
// @access  Public
router.get('/verify/:verificationCode', async (req, res, next) => {
  try {
    const { verificationCode } = req.params;

    const certificate = await db('project_certificates as pc')
      .select([
        'pc.*',
        'u.first_name',
        'u.last_name',
        'u.avatar_url',
        'p.title as project_title',
        'p.description as project_description',
        'issuer.first_name as issuer_first_name',
        'issuer.last_name as issuer_last_name',
        'issuer.avatar_url as issuer_avatar'
      ])
      .join('users as u', 'pc.user_id', 'u.id')
      .join('projects as p', 'pc.project_id', 'p.id')
      .leftJoin('users as issuer', 'pc.issued_by', 'issuer.id')
      .where('pc.verification_code', verificationCode)
      .andWhere('pc.is_public', true)
      .first();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found or not publicly accessible'
      });
    }

    // Check if certificate is expired
    const isExpired = certificate.expiry_date && new Date(certificate.expiry_date) < new Date();
    const isRevoked = certificate.status === 'revoked';

    res.status(200).json({
      success: true,
      data: {
        ...certificate,
        is_expired: isExpired,
        is_revoked: isRevoked,
        is_valid: !isExpired && !isRevoked && certificate.status === 'issued'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark certificate as verified
// @route   POST /api/project-certificates/:certificateId/verify
// @access  Private
router.post('/:certificateId/verify', protect, async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const { verification_method = 'manual' } = req.body;

    // Verify user has permission to verify certificate
    const certificate = await db('project_certificates as pc')
      .select(['pc.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pc.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pc.id', certificateId)
      .first();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    if (!['admin', 'mentor'].includes(certificate.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to verify certificates'
      });
    }

    await db('project_certificates')
      .where({ id: certificateId })
      .update({
        is_verified: true,
        verified_at: new Date(),
        verification_method,
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Certificate verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CERTIFICATE SHARING ====================

// @desc    Update certificate sharing settings
// @route   PUT /api/project-certificates/:certificateId/sharing
// @access  Private
router.put('/:certificateId/sharing', protect, async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const { is_public, allow_sharing, shared_platforms } = req.body;

    // Verify user owns the certificate
    const certificate = await db('project_certificates')
      .where({ id: certificateId, user_id: req.user.id })
      .first();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found or insufficient permissions'
      });
    }

    await db('project_certificates')
      .where({ id: certificateId })
      .update({
        is_public: is_public !== undefined ? is_public : certificate.is_public,
        allow_sharing: allow_sharing !== undefined ? allow_sharing : certificate.allow_sharing,
        shared_platforms: JSON.stringify(shared_platforms || []),
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Sharing settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Share certificate to platform
// @route   POST /api/project-certificates/:certificateId/share
// @access  Private
router.post('/:certificateId/share', protect, async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const { platform, share_url } = req.body;

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    // Verify user owns the certificate
    const certificate = await db('project_certificates')
      .where({ id: certificateId, user_id: req.user.id })
      .first();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found or insufficient permissions'
      });
    }

    if (!certificate.allow_sharing) {
      return res.status(400).json({
        success: false,
        error: 'Certificate sharing is not enabled'
      });
    }

    // Update shared platforms
    const sharedPlatforms = JSON.parse(certificate.shared_platforms || '[]');
    const existingPlatform = sharedPlatforms.find(p => p.platform === platform);
    
    if (existingPlatform) {
      existingPlatform.share_url = share_url;
      existingPlatform.shared_at = new Date();
    } else {
      sharedPlatforms.push({
        platform,
        share_url,
        shared_at: new Date()
      });
    }

    await db('project_certificates')
      .where({ id: certificateId })
      .update({
        shared_platforms: JSON.stringify(sharedPlatforms),
        share_count: certificate.share_count + 1,
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: `Certificate shared to ${platform} successfully`,
      data: { platform, share_url }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CERTIFICATE GENERATION ====================

// @desc    Generate certificate PDF
// @route   POST /api/project-certificates/:certificateId/generate
// @access  Private
router.post('/:certificateId/generate', protect, async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const { format = 'pdf', template_id } = req.body;

    // Verify user has access to certificate
    const certificate = await db('project_certificates as pc')
      .select(['pc.*', 'pm.role'])
      .leftJoin('project_members as pm', function() {
        this.on('pc.project_id', '=', 'pm.project_id')
          .andOn('pm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('pc.id', certificateId)
      .first();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    // Check if user owns certificate or has admin/mentor access
    if (certificate.user_id !== req.user.id && !['admin', 'mentor'].includes(certificate.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to generate certificate'
      });
    }

    // In a real implementation, this would generate the actual certificate file
    // For now, we'll just return a placeholder URL
    const certificateUrl = `https://ispora.com/certificates/${certificate.verification_code}.${format}`;

    await db('project_certificates')
      .where({ id: certificateId })
      .update({
        certificate_url: certificateUrl,
        updated_at: new Date()
      });

    res.status(200).json({
      success: true,
      message: 'Certificate generated successfully',
      data: {
        certificate_url: certificateUrl,
        format,
        download_url: certificateUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CERTIFICATE ANALYTICS ====================

// @desc    Get certificate analytics
// @route   GET /api/project-certificates/:projectId/analytics
// @access  Private
router.get('/:projectId/analytics', protect, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify user has admin/mentor access
    const projectAccess = await db('project_members')
      .where({ project_id: projectId, user_id: req.user.id, status: 'active' })
      .first();

    if (!projectAccess || !['admin', 'mentor'].includes(projectAccess.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view analytics'
      });
    }

    const [
      totalCertificates,
      certificatesByType,
      certificatesByLevel,
      certificatesByStatus,
      averageScore,
      recentCertificates,
      topPerformers
    ] = await Promise.all([
      db('project_certificates').where({ project_id: projectId }).count('* as count').first(),
      db('project_certificates')
        .select('type')
        .count('* as count')
        .where({ project_id: projectId })
        .groupBy('type'),
      db('project_certificates')
        .select('level')
        .count('* as count')
        .where({ project_id: projectId })
        .whereNotNull('level')
        .groupBy('level'),
      db('project_certificates')
        .select('status')
        .count('* as count')
        .where({ project_id: projectId })
        .groupBy('status'),
      db('project_certificates')
        .where({ project_id: projectId })
        .whereNotNull('score')
        .avg('score as avg')
        .first(),
      db('project_certificates as pc')
        .select([
          'pc.*',
          'u.first_name',
          'u.last_name',
          'u.avatar_url'
        ])
        .join('users as u', 'pc.user_id', 'u.id')
        .where('pc.project_id', projectId)
        .orderBy('pc.issued_date', 'desc')
        .limit(10),
      db('project_certificates as pc')
        .select([
          'u.id',
          'u.first_name',
          'u.last_name',
          'u.avatar_url',
          db.raw('COUNT(*) as certificate_count'),
          db.raw('AVG(pc.score) as avg_score')
        ])
        .join('users as u', 'pc.user_id', 'u.id')
        .where('pc.project_id', projectId)
        .groupBy('u.id', 'u.first_name', 'u.last_name', 'u.avatar_url')
        .orderBy('certificate_count', 'desc')
        .limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_certificates: parseInt(totalCertificates.count),
        certificates_by_type: certificatesByType,
        certificates_by_level: certificatesByLevel,
        certificates_by_status: certificatesByStatus,
        average_score: parseFloat(averageScore.avg) || 0,
        recent_certificates: recentCertificates,
        top_performers: topPerformers
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
