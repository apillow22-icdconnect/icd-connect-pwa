const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { schedules, messages, users } = require('../data/users');
const { auth, requireRole } = require('../middleware/auth');
const { io } = require('../index');

const router = express.Router();

// Helper function to send shift assignment notifications
const sendShiftAssignmentNotifications = (schedule, shifts, creator) => {
  const notifications = [];
  
  shifts.forEach(shift => {
    if (shift.employeeId) {
      const employee = users.find(u => u.id === shift.employeeId);
      if (employee) {
        // Create notification message
        const notificationMessage = {
          id: uuidv4(),
          content: `You have been assigned a shift: ${shift.day} from ${shift.startTime} to ${shift.endTime}. Schedule: ${schedule.title}`,
          senderId: creator.id,
          senderName: creator.name,
          recipientId: shift.employeeId,
          isGroupMessage: false,
          teamId: schedule.teamId,
          timestamp: new Date().toISOString(),
          type: 'shift_assignment'
        };
        
        messages.push(notificationMessage);
        notifications.push(notificationMessage);
        
        // Emit socket notification to the specific user
        io.to(`user-${shift.employeeId}`).emit('shift-assigned', {
          type: 'shift_assignment',
          message: notificationMessage,
          schedule: schedule,
          shift: shift
        });
      }
    }
  });
  
  return notifications;
};

// Get all schedules for the team
router.get('/', auth, (req, res) => {
  try {
    const teamSchedules = schedules
      .filter(schedule => schedule.teamId === req.user.teamId)
      .sort((a, b) => new Date(b.createdAt || b.uploadDate) - new Date(a.createdAt || a.uploadDate));

    res.json(teamSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new interactive schedule (Admin only)
router.post('/', auth, requireRole(['admin']), (req, res) => {
  try {
    const { title, description, weekOf, type, activities, shifts } = req.body;

    if (!title || !weekOf) {
      return res.status(400).json({ message: 'Title and week of are required' });
    }

    const newSchedule = {
      id: uuidv4(),
      title: title.trim(),
      description: description || '',
      weekOf: weekOf,
      type: type || 'work',
      activities: activities || [],
      shifts: shifts || [],
      createdBy: req.user.id,
      creatorName: req.user.name,
      teamId: req.user.teamId,
      createdAt: new Date().toISOString()
    };

    schedules.push(newSchedule);

    // Send notifications for assigned shifts
    let notifications = [];
    if (shifts && shifts.length > 0) {
      notifications = sendShiftAssignmentNotifications(newSchedule, shifts, req.user);
    }

    res.status(201).json({
      message: 'Schedule created successfully',
      data: newSchedule,
      notifications: notifications
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific schedule
router.get('/:id', auth, (req, res) => {
  try {
    const schedule = schedules.find(s => s.id === req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.teamId !== req.user.teamId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a schedule (Admin only, or creator)
router.put('/:id', auth, requireRole(['admin']), (req, res) => {
  try {
    const scheduleIndex = schedules.findIndex(s => s.id === req.params.id);
    
    if (scheduleIndex === -1) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const schedule = schedules[scheduleIndex];
    
    // Check if user is admin or the creator of the schedule
    if (req.user.role !== 'admin' && schedule.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this schedule' });
    }

    const { title, description, weekOf, type, activities, shifts } = req.body;

    if (!title || !weekOf) {
      return res.status(400).json({ message: 'Title and week of are required' });
    }

    const updatedSchedule = {
      ...schedule,
      title: title.trim(),
      description: description || '',
      weekOf: weekOf,
      type: type || 'work',
      activities: activities || [],
      shifts: shifts || [],
      updatedAt: new Date().toISOString()
    };

    schedules[scheduleIndex] = updatedSchedule;

    // Send notifications for new or updated shifts
    let notifications = [];
    if (shifts && shifts.length > 0) {
      notifications = sendShiftAssignmentNotifications(updatedSchedule, shifts, req.user);
    }

    res.json({
      ...schedules[scheduleIndex],
      notifications: notifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a schedule (Admin only, or creator)
router.delete('/:id', auth, requireRole(['admin']), (req, res) => {
  try {
    const scheduleIndex = schedules.findIndex(s => s.id === req.params.id);
    
    if (scheduleIndex === -1) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const schedule = schedules[scheduleIndex];
    
    // Check if user is admin or the creator of the schedule
    if (req.user.role !== 'admin' && schedule.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this schedule' });
    }

    schedules.splice(scheduleIndex, 1);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
