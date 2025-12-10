import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { DatabaseService } from '../database/database.js';
import { v4 as uuidv4 } from 'uuid';
import { ConnectionRequest, NetworkUser } from '../types/index.js';

const router = express.Router();
const db = DatabaseService.getInstance();

// Get network users
router.get('/users', authenticate, (req, res) => {
  try {
    const { search, university, role, connectionStatus } = req.query;
    const currentUserId = (req as AuthRequest).user!.id;
    
    let users = db.getUsers();
    
    // Convert to NetworkUser format and filter out current user
    let networkUsers: NetworkUser[] = users
      .filter(u => u.id !== currentUserId)
      .map(user => {
        // Determine connection status
        const requests = db.getConnectionRequests(currentUserId);
        const sentRequest = requests.find(r => r.fromUserId === currentUserId && r.toUserId === user.id && r.status === 'pending');
        const receivedRequest = requests.find(r => r.toUserId === currentUserId && r.fromUserId === user.id && r.status === 'pending');
        const acceptedRequest = requests.find(r => 
          ((r.fromUserId === currentUserId && r.toUserId === user.id) || 
           (r.toUserId === currentUserId && r.fromUserId === user.id)) && 
          r.status === 'accepted'
        );
        
        let connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected' = 'none';
        if (acceptedRequest) {
          connectionStatus = 'connected';
        } else if (sentRequest) {
          connectionStatus = 'pending_sent';
        } else if (receivedRequest) {
          connectionStatus = 'pending_received';
        }
        
        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          title: user.title,
          company: user.company,
          location: user.location,
          university: user.university,
          graduationYear: user.graduationYear,
          program: user.program,
          bio: user.bio,
          skills: user.skills,
          expertise: user.expertise,
          role: user.role,
          experience: user.experience,
          connectionStatus,
          mutualConnections: user.mutualConnections,
          responseRate: user.responseRate,
          isVerified: user.isVerified,
          isOnline: user.isOnline,
          lastActive: user.lastActive,
          interests: user.interests,
          socialLinks: user.socialLinks,
          achievements: user.achievements,
          availability: user.availability,
          openTo: user.openTo,
        };
      });
    
    // Filter by search
    if (search) {
      const searchLower = (search as string).toLowerCase();
      networkUsers = networkUsers.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.company.toLowerCase().includes(searchLower) ||
        u.university.toLowerCase().includes(searchLower) ||
        u.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by university
    if (university) {
      networkUsers = networkUsers.filter(u => u.university === university);
    }
    
    // Filter by role
    if (role) {
      networkUsers = networkUsers.filter(u => u.role === role);
    }
    
    // Filter by connection status
    if (connectionStatus) {
      networkUsers = networkUsers.filter(u => u.connectionStatus === connectionStatus);
    }
    
    res.json(networkUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send connection request
router.post('/connect', authenticate, (req: AuthRequest, res) => {
  try {
    const { userId, purpose, message } = req.body;
    const currentUser = db.getUserById((req as AuthRequest).user!.id);
    const targetUser = db.getUserById(userId);
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if request already exists
    const existingRequest = db.getConnectionRequests().find(
      r => r.fromUserId === currentUser.id && r.toUserId === userId && r.status === 'pending'
    );
    
    if (existingRequest) {
      return res.status(400).json({ error: 'Connection request already sent' });
    }
    
    const request: ConnectionRequest = {
      id: uuidv4(),
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatar,
      fromUserTitle: currentUser.title,
      fromUserCompany: currentUser.company,
      toUserId: userId,
      purpose: purpose || '',
      message: message || '',
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    
    const created = db.createConnectionRequest(request);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get connection requests
router.get('/requests', authenticate, (req: AuthRequest, res) => {
  try {
    const requests = db.getConnectionRequests((req as AuthRequest).user!.id);
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept connection request
router.post('/requests/:requestId/accept', authenticate, (req: AuthRequest, res) => {
  try {
    const request = db.getDatabase().connectionRequests.find(r => r.id === req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.toUserId !== (req as AuthRequest).user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.updateConnectionRequest(req.params.requestId, { status: 'accepted' });
    res.json({ success: true, message: 'Connection request accepted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Decline connection request
router.post('/requests/:requestId/decline', authenticate, (req: AuthRequest, res) => {
  try {
    const request = db.getDatabase().connectionRequests.find(r => r.id === req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.toUserId !== (req as AuthRequest).user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.updateConnectionRequest(req.params.requestId, { status: 'declined' });
    res.json({ success: true, message: 'Connection request declined' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

