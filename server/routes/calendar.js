const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for calendar events (in production, this would be a database)
let calendarEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly team meeting to discuss progress and upcoming tasks',
    date: '2024-01-15',
    type: 'meeting',
    color: 'success',
    createdBy: '1',
    createdAt: '2024-01-10T10:00:00.000Z'
  },
  {
    id: '2',
    title: 'Product Training Deadline',
    description: 'Deadline for completing product knowledge training modules',
    date: '2024-01-20',
    type: 'deadline',
    color: 'error',
    createdBy: '1',
    createdAt: '2024-01-12T14:30:00.000Z'
  },
  {
    id: '3',
    title: 'Campaign Kickoff',
    description: 'Official start of the new marketing campaign',
    date: '2024-01-25',
    type: 'event',
    color: 'warning',
    createdBy: '2',
    createdAt: '2024-01-15T09:15:00.000Z'
  }
];

// Get all calendar events
router.get('/events', auth, async (req, res) => {
  try {
    res.json(calendarEvents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar events' });
  }
});

// Create a new calendar event (admin/team_leader only)
router.post('/events', auth, requireRole(['admin', 'team_leader']), async (req, res) => {
  try {
    const { title, description, date, type, color } = req.body;

    if (!title || !date || !type) {
      return res.status(400).json({ message: 'Title, date, and type are required' });
    }

    const newEvent = {
      id: uuidv4(),
      title,
      description: description || '',
      date,
      type,
      color: color || 'primary',
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    calendarEvents.push(newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating calendar event' });
  }
});

// Get a specific calendar event
router.get('/events/:id', auth, async (req, res) => {
  try {
    const event = calendarEvents.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar event' });
  }
});

// Update a calendar event (admin/team_leader only, or creator)
router.put('/events/:id', auth, requireRole(['admin', 'team_leader']), async (req, res) => {
  try {
    const eventIndex = calendarEvents.findIndex(e => e.id === req.params.id);
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }

    const event = calendarEvents[eventIndex];
    
    // Check if user is admin/team_leader or the creator of the event
    if (req.user.role !== 'admin' && req.user.role !== 'team_leader' && event.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { title, description, date, type, color } = req.body;

    if (!title || !date || !type) {
      return res.status(400).json({ message: 'Title, date, and type are required' });
    }

    calendarEvents[eventIndex] = {
      ...event,
      title,
      description: description || '',
      date,
      type,
      color: color || 'primary',
      updatedAt: new Date().toISOString()
    };

    res.json(calendarEvents[eventIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating calendar event' });
  }
});

// Delete a calendar event (admin/team_leader only, or creator)
router.delete('/events/:id', auth, requireRole(['admin', 'team_leader']), async (req, res) => {
  try {
    const eventIndex = calendarEvents.findIndex(e => e.id === req.params.id);
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }

    const event = calendarEvents[eventIndex];
    
    // Check if user is admin/team_leader or the creator of the event
    if (req.user.role !== 'admin' && req.user.role !== 'team_leader' && event.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    calendarEvents.splice(eventIndex, 1);
    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting calendar event' });
  }
});

// Get events for a specific date range
router.get('/events/range/:startDate/:endDate', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const eventsInRange = calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    });

    res.json(eventsInRange);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events for date range' });
  }
});

// Get events for a specific month
router.get('/events/month/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const eventsInMonth = calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });

    res.json(eventsInMonth);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events for month' });
  }
});

module.exports = router;
