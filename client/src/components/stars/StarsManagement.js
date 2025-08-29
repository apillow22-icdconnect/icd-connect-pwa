import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Paper,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Star,
  Add,
  Refresh,
  History,
  Person,
  TrendingUp,
  EmojiEvents
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const StarsManagement = () => {
  const { user } = useAuth();
  const [teamStars, setTeamStars] = useState([]);
  const [starHistory, setStarHistory] = useState([]);
  const [addStarsDialogOpen, setAddStarsDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [starAmount, setStarAmount] = useState('');
  const [starReason, setStarReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeamStars();
    fetchStarHistory();
  }, []);

  const fetchTeamStars = async () => {
    try {
      const response = await axios.get('/api/stars/team');
      setTeamStars(response.data);
    } catch (error) {
      console.error('Error fetching team stars:', error);
    }
  };

  const fetchStarHistory = async () => {
    try {
      const response = await axios.get('/api/stars/history');
      setStarHistory(response.data);
    } catch (error) {
      console.error('Error fetching star history:', error);
    }
  };

  const handleAddStars = async () => {
    if (!selectedUser || !starAmount || !starReason) {
      setError('Please fill in all fields');
      return;
    }

    if (parseInt(starAmount) <= 0) {
      setError('Star amount must be positive');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/stars/add', {
        userId: selectedUser,
        amount: parseInt(starAmount),
        reason: starReason
      });

      setSuccess('Stars added successfully!');
      setAddStarsDialogOpen(false);
      setSelectedUser('');
      setStarAmount('');
      setStarReason('');
      fetchTeamStars();
      fetchStarHistory();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding stars');
    } finally {
      setLoading(false);
    }
  };

  const handleResetStars = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/stars/reset');
      setSuccess('All stars have been reset to zero!');
      setResetDialogOpen(false);
      fetchTeamStars();
      fetchStarHistory();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error resetting stars');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'team_leader': return 'Team Leader';
      case 'campaign_manager': return 'Campaign Manager';
      case 'rep': return 'Rep';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'team_leader': return 'warning';
      case 'campaign_manager': return 'info';
      case 'rep': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          ⭐ Stars Reward System
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddStarsDialogOpen(true)}
          >
            Add Stars
          </Button>
          {user?.role === 'admin' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Refresh />}
              onClick={() => setResetDialogOpen(true)}
            >
              Reset All Stars
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Stars Overview
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Total Stars</TableCell>
                      <TableCell align="right">Earned</TableCell>
                      <TableCell align="right">Spent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamStars.map((star) => (
                      <TableRow key={star.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                              <Person />
                            </Avatar>
                            {star.userName}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRoleLabel(star.userRole)}
                            color={getRoleColor(star.userRole)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <Star sx={{ color: 'gold', mr: 1 }} />
                            {star.totalStars}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{star.earnedStars}</TableCell>
                        <TableCell align="right">{star.spentStars}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Star Activity
              </Typography>
              <List>
                {starHistory.slice(0, 10).map((record) => (
                  <ListItem key={record.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: record.type === 'earned' ? 'success.main' : 'error.main' }}>
                        {record.type === 'earned' ? <TrendingUp /> : <EmojiEvents />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        record.type === 'reset' 
                          ? 'System Reset'
                          : `${record.userName || 'Unknown'} ${record.type === 'earned' ? 'earned' : 'spent'} ${record.amount} stars`
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {record.reason}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Stars Dialog */}
      <Dialog open={addStarsDialogOpen} onClose={() => setAddStarsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⭐ Add Stars to User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Select User"
              >
                {teamStars.map((star) => (
                  <MenuItem key={star.userId} value={star.userId}>
                    {star.userName} ({getRoleLabel(star.userRole)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Number of Stars"
              type="number"
              value={starAmount}
              onChange={(e) => setStarAmount(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <Star sx={{ color: 'gold', mr: 1 }} />
              }}
            />
            
            <TextField
              fullWidth
              label="Reason for Stars"
              value={starReason}
              onChange={(e) => setStarReason(e.target.value)}
              multiline
              rows={3}
              placeholder="e.g., Excellent sales performance, Completed training, Team collaboration"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStarsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddStars} variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Stars'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Stars Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚠️ Reset All Stars</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Are you sure you want to reset all stars to zero for everyone? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetStars} variant="contained" color="error" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset All Stars'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StarsManagement;
