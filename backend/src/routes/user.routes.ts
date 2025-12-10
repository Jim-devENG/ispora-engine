import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { DatabaseService } from '../database/database.js';

const router = express.Router();
const db = DatabaseService.getInstance();

// Get current user profile
router.get('/profile', authenticate, (req: AuthRequest, res) => {
  try {
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, (req: AuthRequest, res) => {
  try {
    const updates = req.body;
    // Don't allow updating password, id, or email through this endpoint
    delete updates.password;
    delete updates.id;
    delete updates.email;
    
    // Recompute name if firstName or lastName changed
    if (updates.firstName || updates.lastName) {
      const currentUser = db.getUserById(req.user!.id);
      if (currentUser) {
        updates.name = `${updates.firstName || currentUser.firstName} ${updates.lastName || currentUser.lastName}`;
      }
    }
    
    const updated = db.updateUser(req.user!.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:userId', authenticate, (req, res) => {
  try {
    const user = db.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

