import express from 'express';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { DatabaseService } from '../database/database.js';
import { v4 as uuidv4 } from 'uuid';
import { Campaign } from '../types/index.js';

const router = express.Router();
const db = DatabaseService.getInstance();

// Get all campaigns
router.get('/', optionalAuth, (req, res) => {
  try {
    const { type, university, status } = req.query;
    
    let campaigns = db.getCampaigns();
    
    // Filter by type
    if (type) {
      campaigns = campaigns.filter(c => c.type === type);
    }
    
    // Filter by university
    if (university) {
      campaigns = campaigns.filter(c => c.university === university);
    }
    
    // Filter by status
    if (status) {
      campaigns = campaigns.filter(c => c.status === status);
    }
    
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get campaign by ID
router.get('/:campaignId', optionalAuth, (req, res) => {
  try {
    const campaign = db.getCampaignById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create campaign
router.post('/', authenticate, (req: AuthRequest, res) => {
  try {
    const campaignData = req.body;
    const user = db.getUserById((req as AuthRequest).user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const campaign: Campaign = {
      id: uuidv4(),
      title: campaignData.title,
      description: campaignData.description,
      type: campaignData.type,
      status: campaignData.status || 'active',
      university: campaignData.university || campaignData.almaMater,
      category: campaignData.category,
      startDate: campaignData.startDate,
      endDate: campaignData.endDate,
      location: campaignData.location,
      isRemote: campaignData.isRemote || false,
      participantGoal: campaignData.participantGoal || 0,
      currentParticipants: 0,
      fundingGoal: campaignData.fundingGoal || 0,
      currentFunding: 0,
      tags: campaignData.tags || [],
      createdBy: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      image: campaignData.image,
      spotsRemaining: campaignData.participantGoal,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createCampaign(campaign);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Join campaign
router.post('/:campaignId/join', authenticate, (req: AuthRequest, res) => {
  try {
    const campaign = db.getCampaignById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Increment participants
    db.updateCampaign(req.params.campaignId, {
      currentParticipants: campaign.currentParticipants + 1,
      spotsRemaining: campaign.spotsRemaining ? campaign.spotsRemaining - 1 : undefined,
    });
    
    res.json({ success: true, message: 'Successfully joined campaign' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

