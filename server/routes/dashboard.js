const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { getSalesByUser, getSalesByDateRange } = require('../data/sales');
const { getUserStarHistory } = require('../data/stars');
const { messages, schedules, users } = require('../data/users');

// In-memory storage for cleared activities state
const clearedActivities = new Set();

// Helper function to format activity data
const formatActivity = (activity, type) => {
  const baseActivity = {
    id: activity.id || `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    timestamp: activity.createdAt || activity.timestamp || activity.date,
    userId: activity.userId || activity.senderId || activity.createdBy
  };

  switch (type) {
    case 'sale':
      return {
        ...baseActivity,
        title: 'Sales Activity',
        description: activity.description,
        details: `${activity.salesCount} sales recorded`,
        icon: '💰',
        priority: 'high'
      };
    
    case 'star_earned':
      return {
        ...baseActivity,
        title: 'Stars Earned',
        description: activity.reason,
        details: `+${activity.amount} stars`,
        icon: '⭐',
        priority: 'medium'
      };
    
    case 'star_spent':
      return {
        ...baseActivity,
        title: 'Stars Spent',
        description: activity.reason,
        details: `-${activity.amount} stars`,
        icon: '💫',
        priority: 'medium'
      };
    
    case 'schedule_created':
      return {
        ...baseActivity,
        title: 'Schedule Created',
        description: activity.title,
        details: `Week of ${activity.weekOf}`,
        icon: '📅',
        priority: 'medium'
      };
    
    case 'shift_assigned':
      return {
        ...baseActivity,
        title: 'Shift Assigned',
        description: `Shift assigned in ${activity.scheduleTitle || 'schedule'}`,
        details: activity.content,
        icon: '⏰',
        priority: 'high'
      };
    
    case 'message':
      return {
        ...baseActivity,
        title: activity.isGroupMessage ? 'Team Message' : 'Private Message',
        description: activity.content.substring(0, 100) + (activity.content.length > 100 ? '...' : ''),
        details: `From ${activity.senderName}`,
        icon: '💬',
        priority: 'low'
      };
    
    default:
      return {
        ...baseActivity,
        title: 'Activity',
        description: 'Unknown activity type',
        details: '',
        icon: '📋',
        priority: 'low'
      };
  }
};

// Get recent activities (excluding cleared ones)
router.get('/recent-activities', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, days = 7 } = req.query;
    
    // If user has cleared activities, return empty array
    if (clearedActivities.has(userId)) {
      return res.json([]);
    }

    const activities = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    // 1. Fetch recent sales activities
    const recentSales = getSalesByDateRange(cutoffDate, new Date());
    const userSales = recentSales.filter(sale => sale.userId === userId);
    userSales.forEach(sale => {
      activities.push(formatActivity(sale, 'sale'));
    });

    // 2. Fetch recent star activities
    const starHistory = getUserStarHistory(userId);
    const recentStarHistory = starHistory.filter(history => 
      new Date(history.createdAt) >= cutoffDate
    );
    recentStarHistory.forEach(history => {
      activities.push(formatActivity(history, history.type === 'earned' ? 'star_earned' : 'star_spent'));
    });

    // 3. Fetch recent schedule activities
    const recentSchedules = schedules.filter(schedule => 
      schedule.teamId === req.user.teamId &&
      new Date(schedule.createdAt) >= cutoffDate
    );
    recentSchedules.forEach(schedule => {
      activities.push(formatActivity(schedule, 'schedule_created'));
    });

    // 4. Fetch recent messages (both sent and received)
    const recentMessages = messages.filter(message => 
      message.teamId === req.user.teamId &&
      (message.senderId === userId || message.recipientId === userId) &&
      new Date(message.timestamp) >= cutoffDate
    );
    recentMessages.forEach(message => {
      activities.push(formatActivity(message, 'message'));
    });

    // 5. Fetch shift assignment notifications
    const shiftNotifications = messages.filter(message => 
      message.teamId === req.user.teamId &&
      message.recipientId === userId &&
      message.type === 'shift_assignment' &&
      new Date(message.timestamp) >= cutoffDate
    );
    shiftNotifications.forEach(notification => {
      activities.push(formatActivity(notification, 'shift_assigned'));
    });

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit the number of activities returned
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.json(limitedActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Error fetching recent activities' });
  }
});

// Get activity summary for dashboard
router.get('/activity-summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's activities
    const todaySales = getSalesByDateRange(startOfDay, today).filter(sale => sale.userId === userId);
    const todayStarHistory = getUserStarHistory(userId).filter(history => 
      new Date(history.createdAt) >= startOfDay
    );
    const todayMessages = messages.filter(message => 
      message.teamId === req.user.teamId &&
      (message.senderId === userId || message.recipientId === userId) &&
      new Date(message.timestamp) >= startOfDay
    );

    // This week's activities
    const weekSales = getSalesByDateRange(startOfWeek, today).filter(sale => sale.userId === userId);
    const weekStarHistory = getUserStarHistory(userId).filter(history => 
      new Date(history.createdAt) >= startOfWeek
    );

    // This month's activities
    const monthSales = getSalesByDateRange(startOfMonth, today).filter(sale => sale.userId === userId);

    const summary = {
      today: {
        sales: todaySales.length,
        starsEarned: todayStarHistory.filter(h => h.type === 'earned').reduce((sum, h) => sum + h.amount, 0),
        starsSpent: todayStarHistory.filter(h => h.type === 'spent').reduce((sum, h) => sum + h.amount, 0),
        messages: todayMessages.length
      },
      thisWeek: {
        sales: weekSales.length,
        starsEarned: weekStarHistory.filter(h => h.type === 'earned').reduce((sum, h) => sum + h.amount, 0),
        starsSpent: weekStarHistory.filter(h => h.type === 'spent').reduce((sum, h) => sum + h.amount, 0)
      },
      thisMonth: {
        sales: monthSales.length
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({ message: 'Error fetching activity summary' });
  }
});

// Clear recent activities for a user
router.post('/clear-activities', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mark activities as cleared for this user
    clearedActivities.add(userId);
    
    res.json({ message: 'Recent activities cleared successfully' });
  } catch (error) {
    console.error('Error clearing activities:', error);
    res.status(500).json({ message: 'Error clearing activities' });
  }
});

// Reset cleared activities for a user (optional - for testing)
router.post('/reset-activities', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Remove user from cleared activities set
    clearedActivities.delete(userId);
    
    res.json({ message: 'Recent activities reset successfully' });
  } catch (error) {
    console.error('Error resetting activities:', error);
    res.status(500).json({ message: 'Error resetting activities' });
  }
});

module.exports = router;
