const express = require('express');
const router = express.Router();

// Mock network discovery
router.get('/discovery', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'user-1',
        name: 'John Doe',
        title: 'Software Engineer',
        company: 'TechCorp',
        location: 'San Francisco',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isVerified: true,
        mutualConnections: 5,
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        title: 'Product Manager',
        company: 'InnovateLab',
        location: 'New York',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        isVerified: true,
        mutualConnections: 3,
      },
    ],
  });
});

// Mock network connections
router.get('/connections', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'conn-1',
        name: 'Alice Johnson',
        title: 'Data Scientist',
        company: 'DataCorp',
        location: 'Seattle',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        isVerified: true,
        connectionDate: '2024-01-15',
        status: 'connected',
      },
    ],
  });
});

// Mock connection requests
router.get('/connections/requests', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'req-1',
        name: 'Bob Wilson',
        title: 'UX Designer',
        company: 'DesignStudio',
        location: 'Austin',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isVerified: false,
        requestDate: '2024-02-20',
        status: 'pending',
      },
    ],
  });
});

// Mock credits overview
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      balance: 150,
      earned: 200,
      spent: 50,
      level: 'Bronze',
      nextLevel: 'Silver',
      pointsToNext: 50,
    },
  });
});

// Mock credits badges
router.get('/badges', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'badge-1',
        name: 'First Project',
        description: 'Completed your first project',
        icon: '🎯',
        earned: true,
        earnedDate: '2024-01-15',
      },
      {
        id: 'badge-2',
        name: 'Mentor',
        description: 'Helped 5 students',
        icon: '👨‍🏫',
        earned: false,
        progress: 3,
      },
    ],
  });
});

// Mock credits leaderboard
router.get('/leaderboard', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        rank: 1,
        name: 'John Doe',
        points: 500,
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      },
      {
        rank: 2,
        name: 'Jane Smith',
        points: 450,
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      },
    ],
  });
});

// Mock credits activities
router.get('/activities', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'activity-1',
        type: 'earned',
        description: 'Completed project "AI Research"',
        points: 50,
        date: '2024-02-20',
      },
      {
        id: 'activity-2',
        type: 'spent',
        description: 'Upgraded to Premium',
        points: -25,
        date: '2024-02-18',
      },
    ],
  });
});

// Mock notifications (mounted at /api/notifications)
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'notif-1',
        title: 'Welcome to iSpora!',
        message: 'Your account has been created successfully.',
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        title: 'New Message',
        message: 'You have a new message from John Doe.',
        type: 'message',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ],
  });
});

module.exports = router;
