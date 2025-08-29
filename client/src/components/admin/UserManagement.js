import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Avatar,
  Tooltip
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import {
  Add,
  Delete,
  Edit,
  Person,
  AdminPanelSettings,
  SupervisorAccount,
  Badge
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const UserManagement = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'rep',
    position: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/api/users/team');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'team_leader': return 'Team Leader';
      case 'campaign_manager': return 'Campaign Manager';
      case 'rep': return 'Representative';
      default: return role;
    }
  };

  const filteredTeamMembers = teamMembers.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.position.toLowerCase().includes(searchLower) ||
      getRoleLabel(member.role).toLowerCase().includes(searchLower)
    );
  });

  const handleAddUser = async () => {
    if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword || !userData.position) {
      setError('Please fill in all required fields');
      return;
    }

    if (userData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/register', userData);
      setSuccess(`User "${userData.name}" created successfully! They can now login with email: ${userData.email}`);
      setAddDialogOpen(false);
      setUserData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'rep',
        position: ''
      });
      fetchTeamMembers();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!userData.name || !userData.email || !userData.position) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.put(`/api/users/${selectedUser.id}`, {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        position: userData.position
      });
      setSuccess('User updated successfully');
      setEditDialogOpen(false);
      setSelectedUser(null);
      setUserData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'rep',
        position: ''
      });
      fetchTeamMembers();
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.delete(`/api/users/${selectedUser.id}`);
      setSuccess('User deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchTeamMembers();
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setUserData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      position: user.position
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'team_leader': return <SupervisorAccount />;
      case 'campaign_manager': return <SupervisorAccount />;
      case 'rep': return <Badge />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'team_leader': return 'warning';
      case 'campaign_manager': return 'warning';
      case 'rep': return 'success';
      default: return 'default';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access user management.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        mt: 4,
        pt: 2,
        position: 'relative',
        zIndex: 10
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          👥 User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
          sx={{
            px: 3,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: 3,
            zIndex: 50
          }}
        >
          ➕ Add Team Member
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="🔍 Search team members by name, email, position, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#f8f9fa',
              '&:hover': {
                backgroundColor: '#e9ecef'
              },
              '&.Mui-focused': {
                backgroundColor: '#ffffff',
                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography variant="body2" color="text.secondary">
                  🔍
                </Typography>
              </InputAdornment>
            )
          }}
        />
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

      <Card>
        <CardContent>
          {/* Search Results Counter */}
          {searchTerm && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                🔍 Found {filteredTeamMembers.length} of {teamMembers.length} team members
              </Typography>
              {filteredTeamMembers.length !== teamMembers.length && (
                <Button
                  size="small"
                  onClick={() => setSearchTerm('')}
                  sx={{ ml: 1 }}
                >
                  Clear Search
                </Button>
              )}
            </Box>
          )}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTeamMembers.length > 0 ? (
                  filteredTeamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>
                            {member.name?.charAt(0)}
                          </Avatar>
                          <Typography variant="body1">
                            {member.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(member.role)}
                          label={getRoleLabel(member.role)}
                          color={getRoleColor(member.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(member)}
                            disabled={member.id === user.id}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openDeleteDialog(member)}
                            disabled={member.id === user.id}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          🔍 No team members found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm ? `No results for "${searchTerm}". Try a different search term.` : 'No team members available.'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh', overflow: 'hidden', mt: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #e0e0e0' }}>
          ➕ Add New Team Member
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'normal' }}>
            Set a password so they can login to the app
          </Typography>
        </DialogTitle>
        <DialogContent sx={{
          pt: 2,
          height: '70vh',
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#90caf9', borderRadius: '8px' },
          '&::-webkit-scrollbar-track': { backgroundColor: '#e3f2fd' }
        }}>
          <TextField
            fullWidth
            label="Full Name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={userData.password}
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
            margin="normal"
            required
            helperText="Minimum 6 characters required for user login"
            inputProps={{
              minLength: 6
            }}
            sx={{
              '& .MuiFormHelperText-root': {
                color: userData.password.length > 0 && userData.password.length < 6 ? 'error.main' : 'text.secondary'
              }
            }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={userData.confirmPassword}
            onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
            margin="normal"
            required
            error={userData.confirmPassword.length > 0 && userData.password !== userData.confirmPassword}
            helperText={
              userData.confirmPassword.length > 0 && userData.password !== userData.confirmPassword
                ? "Passwords don't match"
                : "Re-enter the password to confirm"
            }
          />
          <TextField
            fullWidth
            label="Position"
            value={userData.position}
            onChange={(e) => setUserData({ ...userData, position: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={userData.role}
              label="Role"
              onChange={(e) => setUserData({ ...userData, role: e.target.value })}
            >
              <MenuItem value="rep">Representative</MenuItem>
              <MenuItem value="team_leader">Team Leader</MenuItem>
              <MenuItem value="campaign_manager">Campaign Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setAddDialogOpen(false)}
            variant="outlined"
            sx={{ px: 3 }}
          >
            ❌ Cancel
          </Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            disabled={loading}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            {loading ? '🔄 Creating...' : '✅ Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Team Member</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Position"
            value={userData.position}
            onChange={(e) => setUserData({ ...userData, position: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={userData.role}
              label="Role"
              onChange={(e) => setUserData({ ...userData, role: e.target.value })}
            >
              <MenuItem value="rep">Representative</MenuItem>
              <MenuItem value="team_leader">Team Leader</MenuItem>
              <MenuItem value="campaign_manager">Campaign Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditUser}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Team Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedUser?.name}</strong>? 
            This action cannot be undone and will remove all their data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
