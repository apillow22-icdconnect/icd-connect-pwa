import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
  Add,
  Edit,
  Delete,
  Person,
  Star,
  StarBorder,
  LocalFireDepartment,
  WorkspacePremium,
  MilitaryTech,
  Diamond
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [addSaleDialogOpen, setAddSaleDialogOpen] = useState(false);
  const [editSaleDialogOpen, setEditSaleDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleData, setSaleData] = useState({
    salesCount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    assignedTo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
    if (user?.role === 'admin') {
      fetchTeamMembers();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/api/users/team');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleAddSale = async () => {
    if (!saleData.salesCount || !saleData.description) {
      setError('Please fill in all required fields');
      return;
    }

    if (user?.role === 'admin' && !saleData.assignedTo) {
      setError('Please select a rep to assign this sale to');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/leaderboard', saleData);
      setAddSaleDialogOpen(false);
      setSaleData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        assignedTo: ''
      });
      fetchLeaderboard();
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding sale');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSale = async () => {
    if (!saleData.salesCount || !saleData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.put(`/api/leaderboard/${selectedSale.id}`, saleData);
      setEditSaleDialogOpen(false);
      setSelectedSale(null);
      setSaleData({
        salesCount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchLeaderboard();
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating sale');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async (saleId) => {
    try {
      await axios.delete(`/api/leaderboard/${saleId}`);
      fetchLeaderboard();
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <EmojiEvents sx={{ color: '#FFD700', fontSize: 32 }} />;
      case 2:
        return <MilitaryTech sx={{ color: '#C0C0C0', fontSize: 28 }} />;
      case 3:
        return <WorkspacePremium sx={{ color: '#CD7F32', fontSize: 24 }} />;
      default:
        return <StarBorder sx={{ color: '#1976d2', fontSize: 20 }} />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#1976d2';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'team_leader':
        return 'warning';
      case 'rep':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'team_leader':
        return 'Team Leader';
      case 'rep':
        return 'Representative';
      default:
        return role;
    }
  };

  const canManageSales = user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const totalSales = leaderboard.reduce((sum, entry) => sum + entry.totalSales, 0);
  const averageSales = leaderboard.length > 0 ? totalSales / leaderboard.length : 0;

  return (
    <Box sx={{ pt: 6, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 4 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents sx={{ color: '#FFD700' }} />
          Sales Leaderboard
        </Typography>
        {canManageSales && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddSaleDialogOpen(true)}
            sx={{
              py: 1.5,
              px: 3,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)'
              },
              zIndex: 50,
              position: 'relative'
            }}
          >
            💰 Add Sale
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Team Sales
              </Typography>
              <Typography variant="h4" component="div" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                {totalSales.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Sales
              </Typography>
              <Typography variant="h4" component="div" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {averageSales.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Members
              </Typography>
              <Typography variant="h4" component="div" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {leaderboard.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Top Performer
              </Typography>
              <Typography variant="h6" component="div" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                {leaderboard[0]?.name || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <EmojiEvents sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No sales data yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {canManageSales 
                ? 'Add the first sale to start the leaderboard!'
                : 'Sales data will appear here once admin adds sales'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUp color="primary" />
                Sales Leaderboard
              </Typography>
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#555'
                  }
                }
              }}>
                <List>
                  {leaderboard.map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    <ListItem sx={{ 
                      bgcolor: index < 3 ? '#fff3e0' : 'transparent',
                      borderRadius: 1,
                      mb: 1,
                      border: index < 3 ? `2px solid ${getRankColor(index + 1)}` : '1px solid #e0e0e0'
                    }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: getRankColor(index + 1),
                          width: 48,
                          height: 48,
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {entry.name}
                            </Typography>
                            {getRankIcon(index + 1)}
                            <Chip 
                              label={getRoleLabel(entry.role)} 
                              size="small" 
                              color={getRoleColor(entry.role)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                              {entry.totalSales.toLocaleString()} Total Sales
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {entry.salesCount} sales • {entry.averageSale.toLocaleString()} average
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(entry.totalSales / leaderboard[0]?.totalSales) * 100} 
                              sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        }
                      />
                      {isAdmin && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Sales">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedSale(entry);
                                setSaleData({
                                  amount: '',
                                  description: '',
                                  date: new Date().toISOString().split('T')[0]
                                });
                                setEditSaleDialogOpen(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Sales">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSale(entry.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </ListItem>
                    {index < leaderboard.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                </List>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocalFireDepartment color="error" />
                This Month's Top Performers
              </Typography>
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#555'
                  }
                }
              }}>
                <List>
                  {leaderboard.slice(0, 5).map((entry, index) => (
                  <ListItem key={entry.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: getRankColor(index + 1),
                        width: 32,
                        height: 32,
                        fontSize: '0.9rem'
                      }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={entry.name}
                      secondary={`${entry.totalSales.toLocaleString()}`}
                    />
                    {index < 3 && getRankIcon(index + 1)}
                  </ListItem>
                ))}
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Add Sale Dialog */}
      <Dialog 
        open={addSaleDialogOpen} 
        onClose={() => setAddSaleDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>💰 Add New Sale</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Sale Amount ($)"
            type="number"
            value={saleData.amount}
            onChange={(e) => setSaleData({ ...saleData, amount: e.target.value })}
            margin="normal"
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
          
          <TextField
            fullWidth
            label="Sale Description"
            value={saleData.description}
            onChange={(e) => setSaleData({ ...saleData, description: e.target.value })}
            margin="normal"
            required
            multiline
            rows={3}
            placeholder="Describe the sale (product, customer, etc.)"
          />
          
          {user?.role === 'admin' && (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Assign to Rep</InputLabel>
              <Select
                value={saleData.assignedTo}
                onChange={(e) => setSaleData({ ...saleData, assignedTo: e.target.value })}
                label="Assign to Rep"
              >
                <MenuItem value="">
                  <em>Select a rep to assign this sale to</em>
                </MenuItem>
                {teamMembers
                  .filter(member => member.role === 'rep' || member.role === 'team_leader')
                  .map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name} ({member.role === 'team_leader' ? 'Team Leader' : 'Rep'})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
          
          <TextField
            fullWidth
            label="Sale Date"
            type="date"
            value={saleData.date}
            onChange={(e) => setSaleData({ ...saleData, date: e.target.value })}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSaleDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddSale}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Sale'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog 
        open={editSaleDialogOpen} 
        onClose={() => setEditSaleDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>✏️ Edit Sales Data</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Sale Amount ($)"
            type="number"
            value={saleData.amount}
            onChange={(e) => setSaleData({ ...saleData, amount: e.target.value })}
            margin="normal"
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
          
          <TextField
            fullWidth
            label="Sale Description"
            value={saleData.description}
            onChange={(e) => setSaleData({ ...saleData, description: e.target.value })}
            margin="normal"
            required
            multiline
            rows={3}
            placeholder="Describe the sale (product, customer, etc.)"
          />
          
          <TextField
            fullWidth
            label="Sale Date"
            type="date"
            value={saleData.date}
            onChange={(e) => setSaleData({ ...saleData, date: e.target.value })}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditSaleDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSale}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Sale'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leaderboard;
