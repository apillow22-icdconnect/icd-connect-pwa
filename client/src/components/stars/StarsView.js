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
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Star,
  TrendingUp,
  EmojiEvents,
  Refresh,
  Person
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const StarsView = () => {
  const { user } = useAuth();
  const [userStars, setUserStars] = useState({
    totalStars: 0,
    earnedStars: 0,
    spentStars: 0
  });
  const [starHistory, setStarHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStars();
  }, []);

  const fetchUserStars = async () => {
    try {
      const response = await axios.get('/api/stars/my-stars');
      if (response.data.stars) {
        setUserStars(response.data.stars);
      }
      if (response.data.history) {
        setStarHistory(response.data.history);
      }
    } catch (error) {
      console.error('Error fetching user stars:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHistoryIcon = (type) => {
    switch (type) {
      case 'earned':
        return <TrendingUp />;
      case 'spent':
        return <EmojiEvents />;
      case 'reset':
        return <Refresh />;
      default:
        return <Star />;
    }
  };

  const getHistoryColor = (type) => {
    switch (type) {
      case 'earned':
        return 'success.main';
      case 'spent':
        return 'error.main';
      case 'reset':
        return 'warning.main';
      default:
        return 'primary.main';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, pt: 10 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ⭐ My Stars
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Track your earned stars and achievements
      </Typography>

      <Grid container spacing={3}>
        {/* Stars Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Star sx={{ fontSize: 48, mb: 2, color: 'gold' }} />
              <Typography variant="h3" component="div">
                {userStars.totalStars}
              </Typography>
              <Typography variant="h6">
                Total Stars
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h3" component="div">
                {userStars.earnedStars}
              </Typography>
              <Typography variant="h6">
                Stars Earned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <EmojiEvents sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h3" component="div">
                {userStars.spentStars}
              </Typography>
              <Typography variant="h6">
                Stars Spent
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Star History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Star History
              </Typography>
              {starHistory.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Star sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    No star activity yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Start earning stars by completing tasks and achieving goals!
                  </Typography>
                </Box>
              ) : (
                <List>
                  {starHistory.map((record, index) => (
                    <ListItem key={record.id} divider={index < starHistory.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getHistoryColor(record.type) }}>
                          {getHistoryIcon(record.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">
                              {record.type === 'earned' && `Earned ${record.amount} stars`}
                              {record.type === 'spent' && `Spent ${record.amount} stars`}
                              {record.type === 'reset' && 'System Reset'}
                            </Typography>
                            {record.type !== 'reset' && (
                              <Chip
                                label={`${record.amount} ⭐`}
                                size="small"
                                color={record.type === 'earned' ? 'success' : 'error'}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {record.reason}
                            </Typography>
                            {record.givenBy && (
                              <Typography variant="caption" color="text.secondary">
                                Given by: {record.givenBy}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" display="block">
                              {new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* How to Earn Stars */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 How to Earn Stars
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Sales Performance
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      • Achieve sales targets
                      • Complete bonus milestones
                      • Outstanding customer service
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Training & Development
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      • Complete training modules
                      • Pass knowledge tests
                      • Participate in team activities
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Team Collaboration
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      • Help team members
                      • Share knowledge
                      • Contribute to team success
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Special Recognition
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      • Going above and beyond
                      • Innovative ideas
                      • Leadership qualities
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StarsView;
