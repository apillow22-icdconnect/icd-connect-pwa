import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Message,
  Schedule,
  School,
  Quiz,
  TrendingUp,
  People,
  Assignment,
  CheckCircle,
  AdminPanelSettings,
  EmojiEvents,
  AttachMoney,
  Clear,
  Refresh,
  NavigateNext,
  NavigateBefore,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    messages: 0,
    schedules: 0,
    trainingModules: 0,
    tests: 0,
    teamMembers: 0
  });
  const [userStars, setUserStars] = useState({
    totalStars: 0,
    earnedStars: 0,
    spentStars: 0
  });
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Motivational sales quotes from successful salespeople
  const salesQuotes = [
    {
      quote: "The most important single ingredient in the formula of success is knowing how to get along with people.",
      author: "Grant Cardone",
      title: "Sales Trainer & Author"
    },
    {
      quote: "The only way to get the best of an argument is to avoid it.",
      author: "Dale Carnegie",
      title: "Sales & Leadership Expert"
    },
    {
      quote: "The best revenge is massive success.",
      author: "Jordan Belfort",
      title: "Sales Trainer & Motivational Speaker"
    },
    {
      quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      title: "Former British Prime Minister"
    },
    {
      quote: "The difference between the impossible and the possible lies in determination.",
      author: "Tommy Lasorda",
      title: "Baseball Manager"
    },
    {
      quote: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      title: "Entrepreneur & Innovator"
    },
    {
      quote: "Success is walking from failure to failure with no loss of enthusiasm.",
      author: "Winston Churchill",
      title: "Former British Prime Minister"
    },
    {
      quote: "The only limit to our realization of tomorrow is our doubts of today.",
      author: "Franklin D. Roosevelt",
      title: "Former U.S. President"
    },
    {
      quote: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      title: "Former First Lady & Activist"
    },
    {
      quote: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
      title: "Comedian & Author"
    },
    {
      quote: "The only person you are destined to become is the person you decide to be.",
      author: "Ralph Waldo Emerson",
      title: "Philosopher & Essayist"
    },
    {
      quote: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
      author: "Albert Schweitzer",
      title: "Nobel Peace Prize Winner"
    },
    {
      quote: "The harder you work for something, the greater you'll feel when you achieve it.",
      author: "Anonymous",
      title: "Motivational Quote"
    },
    {
      quote: "Don't limit yourself. Many people limit themselves to what they think they can do. You can go as far as your mind lets you.",
      author: "Mary Kay Ash",
      title: "Entrepreneur & Sales Leader"
    },
    {
      quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb",
      title: "Ancient Wisdom"
    },
    {
      quote: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
      title: "Apple Co-founder"
    },
    {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      title: "Apple Co-founder"
    },
    {
      quote: "Success usually comes to those who are too busy to be looking for it.",
      author: "Henry David Thoreau",
      title: "Philosopher & Author"
    },
    {
      quote: "The road to success and the road to failure are almost exactly the same.",
      author: "Colin Davis",
      title: "Racing Driver"
    },
    {
      quote: "Success is not in what you have, but who you are.",
      author: "Bo Bennett",
      title: "Author & Motivational Speaker"
    },
    {
      quote: "The only way to achieve the impossible is to believe it is possible.",
      author: "Charles Kingsleigh",
      title: "Fictional Character from Alice in Wonderland"
    },
    {
      quote: "Your attitude, not your aptitude, will determine your altitude.",
      author: "Zig Ziglar",
      title: "Sales Trainer & Motivational Speaker"
    },
    {
      quote: "The future depends on what you do today.",
      author: "Mahatma Gandhi",
      title: "Indian Independence Leader"
    },
    {
      quote: "Success is going from failure to failure without losing your enthusiasm.",
      author: "Winston Churchill",
      title: "Former British Prime Minister"
    },
    {
      quote: "The only person you are destined to become is the person you decide to be.",
      author: "Ralph Waldo Emerson",
      title: "Philosopher & Essayist"
    },
    {
      quote: "Don't count the days, make the days count.",
      author: "Muhammad Ali",
      title: "Boxing Champion & Activist"
    },
    {
      quote: "The best way to predict the future is to create it.",
      author: "Peter Drucker",
      title: "Management Consultant & Author"
    },
    {
      quote: "Success is not the key to happiness. Happiness is the key to success.",
      author: "Albert Schweitzer",
      title: "Nobel Peace Prize Winner"
    },
    {
      quote: "The harder you work for something, the greater you'll feel when you achieve it.",
      author: "Anonymous",
      title: "Motivational Quote"
    },
    {
      quote: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      title: "Former U.S. President"
    },
    {
      quote: "The only limit to our realization of tomorrow is our doubts of today.",
      author: "Franklin D. Roosevelt",
      title: "Former U.S. President"
    },
    {
      quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
      author: "Zig Ziglar",
      title: "Sales Trainer & Motivational Speaker"
    },
    {
      quote: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      title: "Entrepreneur & Innovator"
    },
    {
      quote: "Success usually comes to those who are too busy to be looking for it.",
      author: "Henry David Thoreau",
      title: "Philosopher & Author"
    },
    {
      quote: "The road to success and the road to failure are almost exactly the same.",
      author: "Colin Davis",
      title: "Racing Driver"
    },
    {
      quote: "Don't limit yourself. Many people limit themselves to what they think they can do.",
      author: "Mary Kay Ash",
      title: "Entrepreneur & Sales Leader"
    },
    {
      quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb",
      title: "Ancient Wisdom"
    },
    {
      quote: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
      title: "Apple Co-founder"
    },
    {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      title: "Apple Co-founder"
    },
    {
      quote: "Success is walking from failure to failure with no loss of enthusiasm.",
      author: "Winston Churchill",
      title: "Former British Prime Minister"
    },
    {
      quote: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      title: "Former First Lady & Activist"
    },
    {
      quote: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
      title: "Comedian & Author"
    },
    {
      quote: "The only person you are destined to become is the person you decide to be.",
      author: "Ralph Waldo Emerson",
      title: "Philosopher & Essayist"
    },
    {
      quote: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
      author: "Albert Schweitzer",
      title: "Nobel Peace Prize Winner"
    },
    {
      quote: "The harder you work for something, the greater you'll feel when you achieve it.",
      author: "Anonymous",
      title: "Motivational Quote"
    },
    {
      quote: "Don't limit yourself. Many people limit themselves to what they think they can do. You can go as far as your mind lets you.",
      author: "Mary Kay Ash",
      title: "Entrepreneur & Sales Leader"
    },
    {
      quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb",
      title: "Ancient Wisdom"
    },
    {
      quote: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
      title: "Apple Co-founder"
    },
    {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      title: "Apple Co-founder"
    },
    {
      quote: "Success usually comes to those who are too busy to be looking for it.",
      author: "Henry David Thoreau",
      title: "Philosopher & Author"
    },
    {
      quote: "The road to success and the road to failure are almost exactly the same.",
      author: "Colin Davis",
      title: "Racing Driver"
    },
    {
      quote: "Success is not in what you have, but who you are.",
      author: "Bo Bennett",
      title: "Author & Motivational Speaker"
    },
    {
      quote: "The best salespeople are not order takers, they are problem solvers.",
      author: "Grant Cardone",
      title: "Sales Trainer & Author"
    },
    {
      quote: "Sales is not about selling, it's about helping people buy.",
      author: "Zig Ziglar",
      title: "Sales Trainer & Motivational Speaker"
    },
    {
      quote: "Every sale has five basic obstacles: no need, no money, no hurry, no desire, no trust.",
      author: "Zig Ziglar",
      title: "Sales Trainer & Motivational Speaker"
    },
    {
      quote: "People don't buy for logical reasons. They buy for emotional reasons.",
      author: "Zig Ziglar",
      title: "Sales Trainer & Motivational Speaker"
    },
    {
      quote: "You miss 100% of the shots you don't take.",
      author: "Wayne Gretzky",
      title: "Hockey Legend"
    },
    {
      quote: "The most important single ingredient in the formula of success is knowing how to get along with people.",
      author: "Theodore Roosevelt",
      title: "Former U.S. President"
    },
    {
      quote: "The best revenge is massive success.",
      author: "Jordan Belfort",
      title: "Sales Trainer & Motivational Speaker"
    },
    {
      quote: "The only way to get the best of an argument is to avoid it.",
      author: "Dale Carnegie",
      title: "Sales & Leadership Expert"
    },
    {
      quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      title: "Former British Prime Minister"
    },
    {
      quote: "The difference between the impossible and the possible lies in determination.",
      author: "Tommy Lasorda",
      title: "Baseball Manager"
    },
    {
      quote: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      title: "Entrepreneur & Innovator"
    },
    {
      quote: "Success is walking from failure to failure with no loss of enthusiasm.",
      author: "Winston Churchill",
      title: "Former British Prime Minister"
    },
    {
      quote: "The only limit to our realization of tomorrow is our doubts of today.",
      author: "Franklin D. Roosevelt",
      title: "Former U.S. President"
    },
    {
      quote: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      title: "Former First Lady & Activist"
    },
    {
      quote: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
      title: "Comedian & Author"
    },
    {
      quote: "The only person you are destined to become is the person you decide to be.",
      author: "Ralph Waldo Emerson",
      title: "Philosopher & Essayist"
    },
    {
      quote: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
      author: "Albert Schweitzer",
      title: "Nobel Peace Prize Winner"
    },
    {
      quote: "The harder you work for something, the greater you'll feel when you achieve it.",
      author: "Anonymous",
      title: "Motivational Quote"
    },
    {
      quote: "Don't limit yourself. Many people limit themselves to what they think they can do. You can go as far as your mind lets you.",
      author: "Mary Kay Ash",
      title: "Entrepreneur & Sales Leader"
    },
    {
      quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb",
      title: "Ancient Wisdom"
    },
    {
      quote: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
      title: "Apple Co-founder"
    },
    {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      title: "Apple Co-founder"
    },
    {
      quote: "Success usually comes to those who are too busy to be looking for it.",
      author: "Henry David Thoreau",
      title: "Philosopher & Author"
    },
    {
      quote: "The road to success and the road to failure are almost exactly the same.",
      author: "Colin Davis",
      title: "Racing Driver"
    },
    {
      quote: "The only way to achieve the impossible is to believe it is possible.",
      author: "Charles Kingsleigh",
      title: "Fictional Character from Alice in Wonderland"
    },
    {
      quote: "Your attitude, not your aptitude, will determine your altitude.",
      author: "Zig Ziglar",
      title: "Sales Trainer & Motivational Speaker"
    },
    {
      quote: "The future depends on what you do today.",
      author: "Mahatma Gandhi",
      title: "Indian Independence Leader"
    },
    {
      quote: "Success is going from failure to failure without losing your enthusiasm.",
      author: "Winston Churchill",
      title: "Former British Prime Minister"
    },
    {
      quote: "Don't count the days, make the days count.",
      author: "Muhammad Ali",
      title: "Boxing Champion & Activist"
    },
    {
      quote: "The best way to predict the future is to create it.",
      author: "Peter Drucker",
      title: "Management Consultant & Author"
    },
    {
      quote: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      title: "Former U.S. President"
    },
    {
      quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
      author: "Zig Ziglar",
      title: "Sales Trainer & Motivational Speaker"
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Daily quote rotation - no auto-rotation, just daily changes
  // Removed auto-rotation functionality since we want one quote per day

  // Get daily quote based on date - changes at 6am
  const getDailyQuoteIndex = () => {
    const today = new Date();
    const currentHour = today.getHours();
    
    // If it's before 6am, use yesterday's date
    if (currentHour < 6) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayOfYear = Math.floor((yesterday - new Date(yesterday.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      return dayOfYear % salesQuotes.length;
    }
    
    // If it's 6am or later, use today's date
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return dayOfYear % salesQuotes.length;
  };

  // Set initial quote to daily quote - only once per day
  useEffect(() => {
    const today = new Date();
    const currentHour = today.getHours();
    
    // Only change quote if it's 6am or later, and we haven't set it for today
    if (currentHour >= 6) {
      setCurrentQuoteIndex(getDailyQuoteIndex());
    } else {
      // If it's before 6am, use yesterday's quote
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayOfYear = Math.floor((yesterday - new Date(yesterday.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      setCurrentQuoteIndex(dayOfYear % salesQuotes.length);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch team members
      const teamResponse = await axios.get('/api/users/team');
      const teamMembers = teamResponse.data;

      // Fetch recent messages
      const messagesResponse = await axios.get('/api/messages');
      const messages = messagesResponse.data;

      // Fetch schedules
      const schedulesResponse = await axios.get('/api/schedules');
      const schedules = schedulesResponse.data;

      // Fetch training modules
      const trainingResponse = await axios.get('/api/training');
      const trainingModules = trainingResponse.data;

      // Fetch tests
      const testsResponse = await axios.get('/api/tests');
      const tests = testsResponse.data;

      setStats({
        messages: messages.length,
        schedules: schedules.length,
        trainingModules: trainingModules.length,
        tests: tests.length,
        teamMembers: teamMembers.length
      });

      // Quote index is set by daily rotation, not randomly
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchUserStars = async () => {
    try {
      const response = await axios.get('/api/stars/my-stars');
      if (response.data.stars) {
        setUserStars(response.data.stars);
      }
    } catch (error) {
      console.error('Error fetching user stars:', error);
    }
  };

  const handleNextQuote = () => {
    setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % salesQuotes.length);
  };

  const handlePreviousQuote = () => {
    setCurrentQuoteIndex((prevIndex) => 
      prevIndex === 0 ? salesQuotes.length - 1 : prevIndex - 1
    );
  };



  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'team_leader': return 'warning';
      case 'rep': return 'success';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'team_leader': return 'Team Leader';
      case 'rep': return 'Representative';
      default: return role;
    }
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4 } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        {getRoleLabel(user?.role)} • {user?.position}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Team Members"
            value={stats.teamMembers}
            icon={<People />}
            color="primary"
            onClick={() => navigate('/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Messages"
            value={stats.messages}
            icon={<Message />}
            color="info"
            onClick={() => navigate('/messages')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Schedules"
            value={stats.schedules}
            icon={<Schedule />}
            color="success"
            onClick={() => navigate('/schedules')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Training Modules"
            value={stats.trainingModules}
            icon={<School />}
            color="warning"
            onClick={() => navigate('/training')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Tests"
            value={stats.tests}
            icon={<Quiz />}
            color="secondary"
            onClick={() => navigate('/tests')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="My Stars"
            value={userStars.totalStars}
            icon={<Star />}
            color="warning"
            onClick={() => navigate('/stars')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ 
            minHeight: '300px', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            p: 3,
            pt: 8,
            position: 'relative'
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                fontStyle: 'italic',
                color: 'primary.main',
                fontWeight: 'medium',
                lineHeight: 1.4,
                fontSize: '1.5rem'
              }}
            >
              "{salesQuotes[currentQuoteIndex].quote}"
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'text.primary',
                  mb: 0.5
                }}
              >
                — {salesQuotes[currentQuoteIndex].author}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
                {salesQuotes[currentQuoteIndex].title}
              </Typography>
            </Box>
            
            <Box sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              display: 'flex', 
              gap: 1, 
              alignItems: 'center' 
            }}>
              <Tooltip title="Previous quote">
                <IconButton 
                  size="small" 
                  onClick={handlePreviousQuote}
                  color="primary"
                >
                  <NavigateBefore />
                </IconButton>
              </Tooltip>
              <Tooltip title="Next quote">
                <IconButton 
                  size="small" 
                  onClick={handleNextQuote}
                  color="primary"
                >
                  <NavigateNext />
                </IconButton>
              </Tooltip>
            </Box>
            


          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Message />}
                onClick={() => navigate('/messages')}
                fullWidth
              >
                Send Message
              </Button>
              {user?.role === 'admin' && (
                <Button
                  variant="outlined"
                  startIcon={<Schedule />}
                  onClick={() => navigate('/schedules')}
                  fullWidth
                >
                  Create Schedule
                </Button>
              )}
              {user?.role === 'admin' && (
                <Button
                  variant="outlined"
                  startIcon={<School />}
                  onClick={() => navigate('/training')}
                  fullWidth
                >
                  Upload Training
                </Button>
              )}
              {user?.role === 'admin' ? (
                <Button
                  variant="outlined"
                  startIcon={<Quiz />}
                  onClick={() => navigate('/tests')}
                  fullWidth
                >
                  Create Test
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Quiz />}
                  onClick={() => navigate('/tests')}
                  fullWidth
                >
                  Take Test
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<EmojiEvents />}
                onClick={() => navigate('/leaderboard')}
                fullWidth
              >
                View Leaderboard
              </Button>
              {(user?.role === 'team_leader' || user?.role === 'campaign_manager' || user?.role === 'rep') && (
                <Button
                  variant="outlined"
                  startIcon={<AttachMoney />}
                  onClick={() => navigate('/sales-tracker')}
                  fullWidth
                >
                  Log Sales
                </Button>
              )}
              {user?.role === 'admin' && (
                <Button
                  variant="outlined"
                  startIcon={<AdminPanelSettings />}
                  onClick={() => navigate('/users')}
                  fullWidth
                >
                  Manage Users
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>


    </Box>
  );
};

export default Dashboard;
