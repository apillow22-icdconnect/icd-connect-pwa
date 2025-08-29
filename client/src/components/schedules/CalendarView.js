import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Fab,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Add,
  Edit,
  Delete,
  Work,
  School,
  Event,
  Warning,
  Star
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const CalendarView = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    type: 'work'
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [schedulesResponse, eventsResponse] = await Promise.all([
        axios.get('/api/schedules'),
        axios.get('/api/calendar/events')
      ]);
      
      const schedules = schedulesResponse.data.map(schedule => ({
        ...schedule,
        isSchedule: true,
        displayDate: schedule.weekOf
      }));
      
      const customEvents = eventsResponse.data.map(event => ({
        ...event,
        isSchedule: false,
        displayDate: event.date
      }));
      
      setEvents([...schedules, ...customEvents]);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.displayDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date) => {
    if (isAdmin) {
      setSelectedDate(date);
      setEventForm({
        title: '',
        description: '',
        date: date.toISOString().split('T')[0],
        type: 'work'
      });
      setEditingEvent(null);
      setDialogOpen(true);
    }
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    if (isAdmin) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description || '',
        date: event.displayDate.split('T')[0],
        type: event.type || 'work'
      });
      setDialogOpen(true);
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'work': return 'primary';
      case 'training': return 'secondary';
      case 'meeting': return 'success';
      case 'deadline': return 'error';
      case 'event': return 'warning';
      default: return 'default';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'work': return <Work />;
      case 'training': return <School />;
      case 'meeting': return <Event />;
      case 'deadline': return <Warning />;
      case 'event': return <Star />;
      default: return <Event />;
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingEvent) {
        if (editingEvent.isSchedule) {
          await axios.put(`/api/schedules/${editingEvent.id}`, eventForm);
        } else {
          await axios.put(`/api/calendar/events/${editingEvent.id}`, eventForm);
        }
      } else {
        await axios.post('/api/calendar/events', eventForm);
      }
      
      fetchEvents();
      setDialogOpen(false);
      setEventForm({ title: '', description: '', date: '', type: 'work' });
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (editingEvent) {
        if (editingEvent.isSchedule) {
          await axios.delete(`/api/schedules/${editingEvent.id}`);
        } else {
          await axios.delete(`/api/calendar/events/${editingEvent.id}`);
        }
        fetchEvents();
        setDialogOpen(false);
        setEditingEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(
        <Box key={`empty-${i}`} sx={{ 
          p: 2, 
          border: '1px solid #e0e0e0',
          backgroundColor: '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }} />
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <Box
          key={day}
          sx={{
            p: 2,
            border: '1px solid #e0e0e0',
            backgroundColor: isToday ? 'primary.light' : 'background.paper',
            cursor: isAdmin ? 'pointer' : 'default',
            '&:hover': isAdmin ? {
              backgroundColor: 'action.hover'
            } : {},
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
          onClick={() => handleDateClick(date)}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: isToday ? 'bold' : 'normal',
              color: isToday ? 'white' : 'text.primary',
              mb: 1
            }}
          >
            {day}
          </Typography>
                      {dayEvents.map((event, index) => (
              <Chip
                key={`${event.id}-${index}`}
                label={event.title}
                size="medium"
                color={getEventColor(event.type)}
                icon={getEventIcon(event.type)}
                sx={{
                  mb: 1,
                  fontSize: '0.8rem',
                  maxWidth: '100%',
                  cursor: isAdmin ? 'pointer' : 'default',
                  height: 'auto',
                  '& .MuiChip-label': {
                    whiteSpace: 'normal',
                    lineHeight: 1.2
                  }
                }}
                onClick={(e) => handleEventClick(event, e)}
              />
                        ))}
          </Box>
        );
      }
    
    return (
      <Grid container spacing={0} sx={{ 
        border: '1px solid #e0e0e0',
        borderRadius: '0 0 4px 4px',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)',
        minHeight: '600px'
      }}>
        {days}
      </Grid>
    );
  };

  return (
    <Box>
      {/* Instructions for Admin */}
      {isAdmin && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Interactive Calendar Instructions
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              • Click on any date to add a new event
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              • Click on existing events to edit or delete them
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Use the floating "+" button to add events for any date
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Calendar Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <IconButton 
              onClick={() => navigateMonth(-1)}
              color="primary"
            >
              <ChevronLeft />
            </IconButton>
            
            <Typography variant="h6">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Today />}
                onClick={goToToday}
              >
                Today
              </Button>
              <IconButton 
                onClick={() => navigateMonth(1)}
                color="primary"
              >
                <ChevronRight />
            </IconButton>
            </Box>
          </Box>

          {/* Day Headers */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            border: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            borderRadius: '4px 4px 0 0',
            overflow: 'hidden'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Box key={day} sx={{ 
                p: 2, 
                textAlign: 'center', 
                backgroundColor: 'grey.100',
                borderRight: '1px solid #e0e0e0',
                '&:last-child': {
                  borderRight: 'none'
                }
              }}>
                <Typography variant="h6" fontWeight="bold">
                  {day}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Calendar Grid */}
          {renderCalendar()}
        </CardContent>
      </Card>

      {/* Add Event FAB for Admin */}
      {isAdmin && (
        <Tooltip title="Add Event">
          <Fab
            color="primary"
            aria-label="add event"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => {
              setSelectedDate(null);
              setEventForm({
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                type: 'work'
              });
              setEditingEvent(null);
              setDialogOpen(true);
            }}
          >
            <Add />
          </Fab>
        </Tooltip>
      )}

      {/* Add/Edit Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Edit Event' : 'Add New Event'}
          {selectedDate && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Date: {selectedDate.toLocaleDateString()}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Event Title"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={eventForm.date}
              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={eventForm.type}
                label="Event Type"
                onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
              >
                <MenuItem value="work">Work</MenuItem>
                <MenuItem value="training">Training</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="deadline">Deadline</MenuItem>
                <MenuItem value="event">Event</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {editingEvent && (
            <Button onClick={handleDelete} color="error" variant="outlined">
              Delete
            </Button>
          )}
          <Button onClick={handleSubmit} variant="contained">
            {editingEvent ? 'Update' : 'Add'} Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarView;
