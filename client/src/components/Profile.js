import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import {
  Person,
  Email,
  Work,
  Security
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    if (!profileData.name.trim() || !profileData.email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put('/api/users/profile', profileData);
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'team_leader': return 'warning';
      case 'rep': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.name}
              </Typography>
              <Chip
                label={getRoleLabel(user?.role)}
                color={getRoleColor(user?.role)}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="textSecondary">
                {user?.position}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.08)',
            borderRadius: '16px'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  color: '#8B5CF6',
                  fontWeight: 'bold'
                }}>
                  Personal Information
                </Typography>
                <Button
                  variant={editMode ? "outlined" : "contained"}
                  onClick={() => {
                    if (editMode) {
                      setProfileData({
                        name: user?.name || '',
                        email: user?.email || ''
                      });
                    }
                    setEditMode(!editMode);
                    setError('');
                    setSuccess('');
                  }}
                  sx={{
                    ...(editMode ? {
                      borderColor: '#D97706',
                      color: '#D97706',
                      '&:hover': {
                        borderColor: '#B45309',
                        backgroundColor: 'rgba(217, 119, 6, 0.04)'
                      }
                    } : {
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                      }
                    })
                  }}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
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

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!editMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E2E8F0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#8B5CF6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B5CF6',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#64748B',
                        '&.Mui-focused': {
                          color: '#8B5CF6',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: '#8B5CF6' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!editMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E2E8F0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#8B5CF6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B5CF6',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#64748B',
                        '&.Mui-focused': {
                          color: '#8B5CF6',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: '#8B5CF6' }} />
                    }}
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                      },
                      '&:disabled': {
                        background: '#E2E8F0'
                      }
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 3, borderColor: '#D97706' }} />

              <Typography variant="h6" gutterBottom sx={{ 
                color: '#8B5CF6',
                fontWeight: 'bold'
              }}>
                Account Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={getRoleLabel(user?.role)}
                    disabled
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E2E8F0',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#64748B',
                      },
                    }}
                    InputProps={{
                      startAdornment: <Security sx={{ mr: 1, color: '#8B5CF6' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={user?.position || ''}
                    disabled
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E2E8F0',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#64748B',
                      },
                    }}
                    InputProps={{
                      startAdornment: <Work sx={{ mr: 1, color: '#8B5CF6' }} />
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ 
                  color: '#8B5CF6',
                  fontWeight: 'bold'
                }}>
                  Permissions:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user?.role === 'admin' && (
                    <>
                      <Chip label="Full Access" size="small" sx={{ 
                        backgroundColor: '#8B5CF6', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} />
                      <Chip label="User Management" size="small" sx={{ 
                        backgroundColor: '#8B5CF6', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} />
                      <Chip label="Content Creation" size="small" sx={{ 
                        backgroundColor: '#8B5CF6', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} />
                      <Chip label="Test Management" size="small" sx={{ 
                        backgroundColor: '#8B5CF6', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} />
                    </>
                  )}
                  {user?.role === 'team_leader' && (
                    <>
                      <Chip label="Limited Admin" size="small" sx={{ 
                        backgroundColor: '#D97706', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} />
                      <Chip label="Content Creation" size="small" sx={{ 
                        backgroundColor: '#D97706', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} />
                      <Chip label="Test Management" size="small" sx={{ 
                        backgroundColor: '#D97706', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} />
                    </>
                  )}
                  {user?.role === 'rep' && (
                    <>
                      <Chip label="View Content" size="small" sx={{ 
                        backgroundColor: '#10B981', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} />
                      <Chip label="Take Tests" size="small" sx={{ 
                        backgroundColor: '#10B981', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} />
                      <Chip label="Send Messages" size="small" sx={{ 
                        backgroundColor: '#10B981', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} />
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
