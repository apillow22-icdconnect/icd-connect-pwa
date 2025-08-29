const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { 
  stars, 
  starHistory, 
  initializeStarsForUser, 
  addStars, 
  spendStars, 
  resetAllStars, 
  getUserStars, 
  getTeamStars, 
  getUserStarHistory, 
  getTeamStarHistory 
} = require('../data/stars');
const { users } = require('../data/users');

const router = express.Router();

// Get user's own stars
router.get('/my-stars', auth, (req, res) => {
  try {
    let userStars = getUserStars(req.user.id);
    
    // Initialize stars if user doesn't have a record
    if (!userStars) {
      initializeStarsForUser(req.user.id, req.user.teamId);
      userStars = getUserStars(req.user.id);
    }
    
    const history = getUserStarHistory(req.user.id);
    
    res.json({
      stars: userStars,
      history: history
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all team stars (Admin, Team Leader, Campaign Manager only)
router.get('/team', auth, requireRole(['admin', 'team_leader', 'campaign_manager']), (req, res) => {
  try {
    let teamStars = getTeamStars(req.user.teamId);
    
    // Initialize stars for team members who don't have records
    const teamMembers = users.filter(user => user.teamId === req.user.teamId);
    teamMembers.forEach(member => {
      initializeStarsForUser(member.id, member.teamId);
    });
    
    teamStars = getTeamStars(req.user.teamId);
    
    // Add user names to star records
    const starsWithNames = teamStars.map(star => {
      const user = users.find(u => u.id === star.userId);
      return {
        ...star,
        userName: user ? user.name : 'Unknown User',
        userRole: user ? user.role : 'unknown'
      };
    });
    
    res.json(starsWithNames);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add stars to a user (Admin, Team Leader, Campaign Manager only)
router.post('/add', auth, requireRole(['admin', 'team_leader', 'campaign_manager']), (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    
    if (!userId || !amount || !reason) {
      return res.status(400).json({ message: 'User ID, amount, and reason are required' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }
    
    // Check if user exists and is in the same team (unless admin)
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (req.user.role !== 'admin' && targetUser.teamId !== req.user.teamId) {
      return res.status(403).json({ message: 'You can only add stars to users in your team' });
    }
    
    // Initialize stars for user if needed
    initializeStarsForUser(userId, targetUser.teamId);
    
    // Add stars
    const updatedStars = addStars(userId, amount, reason, req.user.name);
    
    if (updatedStars) {
      res.json({
        message: 'Stars added successfully',
        stars: updatedStars
      });
    } else {
      res.status(500).json({ message: 'Failed to add stars' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset all stars (Admin only)
router.post('/reset', auth, requireRole(['admin']), (req, res) => {
  try {
    resetAllStars();
    res.json({ message: 'All stars have been reset to zero' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get star history for team (Admin, Team Leader, Campaign Manager only)
router.get('/history', auth, requireRole(['admin', 'team_leader', 'campaign_manager']), (req, res) => {
  try {
    const history = getTeamStarHistory(req.user.teamId);
    
    // Add user names to history
    const historyWithNames = history.map(record => {
      if (record.userId) {
        const user = users.find(u => u.id === record.userId);
        return {
          ...record,
          userName: user ? user.name : 'Unknown User'
        };
      }
      return record;
    });
    
    res.json(historyWithNames);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
