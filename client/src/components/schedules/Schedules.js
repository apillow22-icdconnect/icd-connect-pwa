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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarToday,
  ViewList,
  Work,
  School,
  Event,
  Warning,
  Star,
  Person,
  Delete as DeleteIcon,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import CalendarView from './CalendarView';
import io from 'socket.io-client';

// Weekly Calendar Component
const WeeklyCalendar = ({ schedules, teamMembers, onDelete, canDelete }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  const getWeekDates = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getShiftsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules
      .filter(schedule => schedule.shifts)
      .flatMap(schedule => 
        schedule.shifts
          .filter(shift => shift.day.toLowerCase() === date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())
          .map(shift => ({
            ...shift,
            scheduleTitle: schedule.title,
            scheduleId: schedule.id
          }))
      );
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const weekDates = getWeekDates(currentWeek);

  return (
    <Box>
      {/* Week Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigateWeek(-1)}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6">
          Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Typography>
        <IconButton onClick={() => navigateWeek(1)}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Weekly Schedule Grid */}
      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
                             <TableCell sx={{ minWidth: 60, fontWeight: 'bold', fontSize: '0.75rem' }}>Time</TableCell>
               {weekDates.map((date, index) => (
                 <TableCell key={index} sx={{ minWidth: 100, fontWeight: 'bold', textAlign: 'center', fontSize: '0.75rem' }}>
                                     <Box>
                     <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                       {daysOfWeek[index]}
                     </Typography>
                     <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                       {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                     </Typography>
                   </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map((time) => (
              <TableRow key={time}>
                                 <TableCell sx={{ fontWeight: 'bold', fontSize: '0.7rem', py: 0.5 }}>
                   {time}
                 </TableCell>
                {weekDates.map((date, dayIndex) => {
                  const shifts = getShiftsForDate(date);
                  const relevantShifts = shifts.filter(shift => {
                    const startHour = parseInt(shift.startTime?.split(':')[0]) || 0;
                    const timeHour = parseInt(time.split(':')[0]) || 0;
                    const timePeriod = time.includes('PM') && timeHour !== 12 ? timeHour + 12 : timeHour;
                    return startHour === timeHour || (startHour <= timeHour && timeHour < (parseInt(shift.endTime?.split(':')[0]) || 0));
                  });

                                     return (
                     <TableCell key={dayIndex} sx={{ p: 0.25, height: 50, minWidth: 100 }}>
                       {relevantShifts.map((shift, shiftIndex) => (
                         <Card 
                           key={shiftIndex} 
                           sx={{ 
                             mb: 0.25, 
                             p: 0.25, 
                             backgroundColor: 'primary.light',
                             color: 'white',
                             fontSize: '0.6rem',
                             cursor: 'pointer',
                             position: 'relative',
                             '&:hover': {
                               backgroundColor: 'primary.main'
                             }
                           }}
                         >
                                                     <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', lineHeight: 1 }}>
                             {shift.startTime} - {shift.endTime}
                           </Typography>
                           <Typography variant="caption" sx={{ display: 'block', lineHeight: 1 }}>
                             {teamMembers.find(m => m.id === shift.employeeId)?.name || 'Unknown'}
                           </Typography>
                                                     {shift.position && (
                             <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, lineHeight: 1 }}>
                               {shift.position}
                             </Typography>
                           )}
                                                     {canDelete && (
                             <IconButton
                               size="small"
                               sx={{ 
                                 position: 'absolute', 
                                 top: 1, 
                                 right: 1, 
                                 color: 'white',
                                 '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                               }}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 onDelete(shift.scheduleId);
                               }}
                             >
                               <DeleteIcon sx={{ fontSize: '0.7rem' }} />
                             </IconButton>
                           )}
                        </Card>
                      ))}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Box sx={{ mt: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" gutterBottom sx={{ fontWeight: 'bold' }}>
          Schedule Legend
        </Typography>
        <Grid container spacing={1}>
          <Grid item>
            <Chip 
              label="Work Shifts" 
              size="small" 
              color="primary" 
              icon={<Work />}
            />
          </Grid>
          <Grid item>
            <Typography variant="caption" color="textSecondary">
              Click on shifts to view details
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

const Schedules = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [socket, setSocket] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    weekOf: '',
    type: 'work',
    activities: [],
    shifts: []
  });

  const canCreateSchedules = user?.role === 'admin';
  const canViewSchedules = user?.role === 'admin' || user?.role === 'team_leader' || user?.role === 'rep';

  useEffect(() => {
    if (canViewSchedules) {
      fetchSchedules();
      fetchTeamMembers();
    }
  }, [canViewSchedules]);

  // Request notification permission and initialize socket
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Socket.io connection disabled for production deployment
    // const newSocket = io('http://localhost:5000');
    // setSocket(newSocket);

    // newSocket.on('shift-assigned', (data) => {
    //   // Show browser notification
    //   if ('Notification' in window && Notification.permission === 'granted') {
    //     new Notification('Shift Assigned', {
    //       body: data.message.content,
    //       icon: '/favicon.ico'
    //     });
    //   }
      
    //   // Show in-app notification
    //   setNotification({
    //     open: true,
    //     message: data.message.content,
    //     severity: 'info'
    //   });
    // });

    // return () => newSocket.close();
  }, []);

  // Join user room for notifications
  useEffect(() => {
    if (user && socket) {
      socket.emit('join-user-room', user.id);
    }
  }, [user, socket]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/api/users/team');
      setTeamMembers(response.data.filter(member => member.role === 'rep' || member.role === 'team_leader'));
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleCreateSchedule = () => {
    setScheduleForm({
      title: '',
      description: '',
      weekOf: new Date().toISOString().split('T')[0],
      type: 'work',
      activities: [],
      shifts: []
    });
    setCreateDialogOpen(true);
  };

  const addActivity = () => {
    setScheduleForm({
      ...scheduleForm,
      activities: [...scheduleForm.activities, { day: '', task: '', time: '' }]
    });
  };

  const addShift = () => {
    setScheduleForm({
      ...scheduleForm,
      shifts: [...scheduleForm.shifts, { 
        day: '', 
        startTime: '', 
        endTime: '', 
        employeeId: '', 
        position: '',
        breakTime: ''
      }]
    });
  };

  const updateActivity = (index, field, value) => {
    const newActivities = [...scheduleForm.activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setScheduleForm({
      ...scheduleForm,
      activities: newActivities
    });
  };

  const updateShift = (index, field, value) => {
    const newShifts = [...scheduleForm.shifts];
    newShifts[index] = { ...newShifts[index], [field]: value };
    setScheduleForm({
      ...scheduleForm,
      shifts: newShifts
    });
  };

  const removeActivity = (index) => {
    const newActivities = scheduleForm.activities.filter((_, i) => i !== index);
    setScheduleForm({
      ...scheduleForm,
      activities: newActivities
    });
  };

  const removeShift = (index) => {
    const newShifts = scheduleForm.shifts.filter((_, i) => i !== index);
    setScheduleForm({
      ...scheduleForm,
      shifts: newShifts
    });
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleForm.title || !scheduleForm.weekOf) {
      setError('Please fill in title and week of');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const scheduleData = {
        title: scheduleForm.title,
        description: scheduleForm.description,
        weekOf: scheduleForm.weekOf,
        type: scheduleForm.type,
        activities: scheduleForm.activities,
        shifts: scheduleForm.shifts,
        createdBy: user.id,
        creatorName: user.name
      };

      const response = await axios.post('/api/schedules', scheduleData);
      console.log('Schedule created successfully:', response.data);
      
      setCreateDialogOpen(false);
      setScheduleForm({
        title: '',
        description: '',
        weekOf: '',
        type: 'work',
        activities: [],
        shifts: []
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create schedule';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    try {
      await axios.delete(`/api/schedules/${scheduleId}`);
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setError('Failed to delete schedule');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getScheduleIcon = (type) => {
    switch (type) {
      case 'work': return <Work />;
      case 'training': return <School />;
      case 'meeting': return <Event />;
      case 'deadline': return <Warning />;
      case 'event': return <Star />;
      default: return <CalendarToday />;
    }
  };

  const getScheduleColor = (type) => {
    switch (type) {
      case 'work': return 'primary';
      case 'training': return 'secondary';
      case 'meeting': return 'success';
      case 'deadline': return 'error';
      case 'event': return 'warning';
      default: return 'default';
    }
  };

  if (!canViewSchedules) {
    return (
      <Box sx={{ p: 2, pt: 1, pb: 1 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Interactive Schedule Calendar
        </Typography>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Access Denied
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have permission to view schedules.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pt: 1, pb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ mb: { xs: 1, sm: 0 } }}>
          Interactive Schedule Calendar
        </Typography>
        {canCreateSchedules && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSchedule}
            size="small"
            sx={{ minWidth: 'fit-content' }}
          >
            Create Schedule
          </Button>
        )}
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="schedule views"
          sx={{ minHeight: 48 }}
        >
          <Tab 
            icon={<CalendarToday />} 
            label="Interactive Calendar" 
            iconPosition="start"
          />
          <Tab 
            icon={<ViewList />} 
            label="Weekly Schedule" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Calendar View (Primary) */}
      {activeTab === 0 && (
        <CalendarView />
      )}

      {/* Weekly Schedule View */}
      {activeTab === 1 && (
        <Box>
          {loading && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading schedules...</Typography>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card sx={{ mb: 3, backgroundColor: 'error.light' }}>
              <CardContent>
                <Typography color="error">{error}</Typography>
              </CardContent>
            </Card>
          )}

          {!loading && schedules.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CalendarToday sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No schedules created yet
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {canCreateSchedules 
                    ? 'Create the first schedule to get started'
                    : 'Schedules will appear here once created by your admin'
                  }
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <WeeklyCalendar 
              schedules={schedules}
              teamMembers={teamMembers}
              onDelete={handleDelete}
              canDelete={canCreateSchedules}
            />
          )}
        </Box>
      )}

      {/* Create Schedule Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Interactive Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {error && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: 'error.light', borderRadius: 1 }}>
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              </Box>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Schedule Title"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Week Of"
                  type="date"
                  value={scheduleForm.weekOf}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, weekOf: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={scheduleForm.description}
              onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Schedule Type</InputLabel>
              <Select
                value={scheduleForm.type}
                label="Schedule Type"
                onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
              >
                <MenuItem value="work">Work Schedule</MenuItem>
                <MenuItem value="training">Training</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="deadline">Deadline</MenuItem>
                <MenuItem value="event">Event</MenuItem>
              </Select>
            </FormControl>

            {scheduleForm.type === 'work' && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Work Shifts
                </Typography>

                {scheduleForm.shifts.map((shift, index) => (
                  <Card key={index} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Day"
                          value={shift.day}
                          onChange={(e) => updateShift(index, 'day', e.target.value)}
                          placeholder="Monday"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Start Time"
                          type="time"
                          value={shift.startTime}
                          onChange={(e) => updateShift(index, 'startTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="End Time"
                          type="time"
                          value={shift.endTime}
                          onChange={(e) => updateShift(index, 'endTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Break Time"
                          value={shift.breakTime}
                          onChange={(e) => updateShift(index, 'breakTime', e.target.value)}
                          placeholder="30 min"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Employee</InputLabel>
                          <Select
                            value={shift.employeeId}
                            label="Employee"
                            onChange={(e) => updateShift(index, 'employeeId', e.target.value)}
                          >
                            {teamMembers.map((member) => (
                              <MenuItem key={member.id} value={member.id}>
                                {member.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <TextField
                          fullWidth
                          label="Position"
                          value={shift.position}
                          onChange={(e) => updateShift(index, 'position', e.target.value)}
                          placeholder="Rep"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeShift(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Card>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addShift}
                  sx={{ mb: 3 }}
                >
                  Add Work Shift
                </Button>
              </>
            )}

            <Typography variant="h6" sx={{ mb: 2 }}>
              Additional Activities
            </Typography>

            {scheduleForm.activities.map((activity, index) => (
              <Card key={index} sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Day"
                      value={activity.day}
                      onChange={(e) => updateActivity(index, 'day', e.target.value)}
                      placeholder="Monday, Tuesday, etc."
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Task/Activity"
                      value={activity.task}
                      onChange={(e) => updateActivity(index, 'task', e.target.value)}
                      placeholder="What needs to be done"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Time"
                      value={activity.time}
                      onChange={(e) => updateActivity(index, 'time', e.target.value)}
                      placeholder="9:00 AM, 2:00 PM, etc."
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <IconButton
                      color="error"
                      onClick={() => removeActivity(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addActivity}
              sx={{ mb: 2 }}
            >
              Add Activity
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleScheduleSubmit} 
            variant="contained"
            disabled={loading || !scheduleForm.title || !scheduleForm.weekOf}
          >
            {loading ? 'Creating...' : 'Create Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Create Schedule */}
      {canCreateSchedules && (
        <Tooltip title="Create Schedule">
          <Fab
            color="primary"
            aria-label="create schedule"
            size="medium"
            sx={{ 
              position: 'fixed', 
              bottom: 20, 
              right: 20,
              zIndex: 1000
            }}
            onClick={handleCreateSchedule}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Schedules;
