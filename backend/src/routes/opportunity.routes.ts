import express from 'express';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { DatabaseService } from '../database/database.js';
import { v4 as uuidv4 } from 'uuid';
import { Opportunity } from '../types/index.js';

const router = express.Router();
const db = DatabaseService.getInstance();

// Get all opportunities
router.get('/', optionalAuth, (req, res) => {
  try {
    const { type, category, location, remote, search } = req.query;
    
    let opportunities = db.getOpportunities();
    
    // Filter by type
    if (type) {
      opportunities = opportunities.filter(o => o.type === type);
    }
    
    // Filter by category
    if (category) {
      opportunities = opportunities.filter(o => o.category === category);
    }
    
    // Filter by location
    if (location) {
      opportunities = opportunities.filter(o => 
        o.location.toLowerCase().includes((location as string).toLowerCase())
      );
    }
    
    // Filter by remote
    if (remote !== undefined) {
      const isRemote = remote === 'true';
      opportunities = opportunities.filter(o => o.remote === isRemote);
    }
    
    // Search
    if (search) {
      const searchLower = (search as string).toLowerCase();
      opportunities = opportunities.filter(o => 
        o.title.toLowerCase().includes(searchLower) ||
        o.description.toLowerCase().includes(searchLower) ||
        o.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    res.json(opportunities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get opportunity by ID
router.get('/:opportunityId', optionalAuth, (req, res) => {
  try {
    const opportunity = db.getOpportunityById(req.params.opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.json(opportunity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create opportunity
router.post('/', authenticate, (req: AuthRequest, res) => {
  try {
    const opportunityData = req.body;
    const user = db.getUserById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const opportunity: Opportunity = {
      id: uuidv4(),
      title: opportunityData.title,
      type: opportunityData.type,
      company: opportunityData.company,
      location: opportunityData.location,
      remote: opportunityData.remote || false,
      description: opportunityData.description,
      requirements: opportunityData.requirements,
      benefits: opportunityData.benefits,
      amount: opportunityData.amount,
      duration: opportunityData.duration,
      commitment: opportunityData.commitment,
      postedBy: {
        name: user.name,
        title: user.title,
        company: user.company,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      university: opportunityData.university,
      tags: opportunityData.tags || [],
      applicants: 0,
      deadline: opportunityData.deadline,
      eventDate: opportunityData.eventDate,
      postedDate: now,
      featured: opportunityData.featured || false,
      urgent: opportunityData.urgent || false,
      boost: 0,
      saved: false,
      applied: false,
      experienceLevel: opportunityData.experienceLevel || 'any',
      category: opportunityData.category,
      eligibility: opportunityData.eligibility,
      applicationLink: opportunityData.applicationLink,
      comments: 0,
      fullDescription: opportunityData.fullDescription,
      applicationProcess: opportunityData.applicationProcess,
      contactInfo: opportunityData.contactInfo,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createOpportunity(opportunity);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Apply to opportunity
router.post('/:opportunityId/apply', authenticate, (req: AuthRequest, res) => {
  try {
    const opportunity = db.getOpportunityById(req.params.opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    // Increment applicants count
    db.updateOpportunity(req.params.opportunityId, {
      applicants: opportunity.applicants + 1,
    });
    
    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save/bookmark opportunity
router.post('/:opportunityId/save', authenticate, (req: AuthRequest, res) => {
  try {
    const opportunity = db.getOpportunityById(req.params.opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    // Toggle saved status
    db.updateOpportunity(req.params.opportunityId, {
      saved: !opportunity.saved,
    });
    
    res.json({ success: true, saved: !opportunity.saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

