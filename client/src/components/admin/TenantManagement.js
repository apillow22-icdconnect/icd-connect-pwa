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
  Switch,
  FormControlLabel,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Business,
  Add,
  Edit,
  Delete,
  Domain,
  Palette,
  Settings,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TenantManagement = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [addTenantDialogOpen, setAddTenantDialogOpen] = useState(false);
  const [editTenantDialogOpen, setEditTenantDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    subdomain: '',
    customDomain: '',
    theme: {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      companyName: '',
      tagline: '',
      logo: '',
      favicon: ''
    },
    features: {
      messaging: true,
      training: true,
      tests: true,
      leaderboard: true,
      salesTracker: true,
      stars: true,
      schedules: true
    },
    settings: {
      maxUsers: 100,
      maxStorage: '1GB',
      customBranding: false,
      whiteLabel: false
    }
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await axios.get('/api/tenants');
      setTenants(response.data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setError('Failed to fetch tenants');
    }
  };

  const handleAddTenant = async () => {
    if (!formData.name) {
      setError('Tenant name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/tenants', formData);
      setSuccess('Tenant created successfully!');
      setAddTenantDialogOpen(false);
      resetForm();
      fetchTenants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTenant = async () => {
    if (!selectedTenant) return;

    setLoading(true);
    setError('');

    try {
      await axios.put(`/api/tenants/${selectedTenant.id}`, formData);
      setSuccess('Tenant updated successfully!');
      setEditTenantDialogOpen(false);
      resetForm();
      fetchTenants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (tenantId === 'default') {
      setError('Cannot delete default tenant');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/tenants/${tenantId}`);
      setSuccess('Tenant deleted successfully!');
      fetchTenants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting tenant');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      subdomain: '',
      customDomain: '',
      theme: {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        companyName: '',
        tagline: '',
        logo: '',
        favicon: ''
      },
      features: {
        messaging: true,
        training: true,
        tests: true,
        leaderboard: true,
        salesTracker: true,
        stars: true,
        schedules: true
      },
      settings: {
        maxUsers: 100,
        maxStorage: '1GB',
        customBranding: false,
        whiteLabel: false
      }
    });
  };

  const openEditDialog = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      domain: tenant.domain || '',
      subdomain: tenant.subdomain || '',
      customDomain: tenant.customDomain || '',
      theme: { ...tenant.theme },
      features: { ...tenant.features },
      settings: { ...tenant.settings }
    });
    setEditTenantDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <Box sx={{ p: 3, pt: 10 }}>
        <Alert severity="error">
          You don't have permission to access this page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          🏢 Tenant Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddTenantDialogOpen(true)}
        >
          Add Tenant
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

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Tenants
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Domain</TableCell>
                  <TableCell>Features</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: tenant.theme.primaryColor }}>
                          <Business />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {tenant.theme.companyName || tenant.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {tenant.theme.tagline}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {tenant.customDomain && (
                          <Chip label={tenant.customDomain} size="small" color="primary" />
                        )}
                        {tenant.subdomain && (
                          <Chip label={`${tenant.subdomain}.domain.com`} size="small" />
                        )}
                        {tenant.domain && (
                          <Chip label={tenant.domain} size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {Object.entries(tenant.features).map(([feature, enabled]) => (
                          <Chip
                            key={feature}
                            label={feature}
                            size="small"
                            color={enabled ? 'success' : 'default'}
                            icon={enabled ? <CheckCircle /> : <Cancel />}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.status}
                        color={getStatusColor(tenant.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(tenant)}
                        >
                          <Edit />
                        </IconButton>
                        {tenant.id !== 'default' && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTenant(tenant.id)}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Tenant Dialog */}
      <Dialog open={addTenantDialogOpen} onClose={() => setAddTenantDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Tenant</DialogTitle>
        <DialogContent>
          <TenantForm formData={formData} setFormData={setFormData} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTenantDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTenant} variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create Tenant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={editTenantDialogOpen} onClose={() => setEditTenantDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Tenant</DialogTitle>
        <DialogContent>
          <TenantForm formData={formData} setFormData={setFormData} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTenantDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditTenant} variant="contained" disabled={loading}>
            {loading ? 'Updating...' : 'Update Tenant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Tenant Form Component
const TenantForm = ({ formData, setFormData }) => {
  const updateFormData = (path, value) => {
    const keys = path.split('.');
    const newData = { ...formData };
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setFormData(newData);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Tenant Name"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Domain"
            value={formData.domain}
            onChange={(e) => updateFormData('domain', e.target.value)}
            placeholder="example.com"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Subdomain"
            value={formData.subdomain}
            onChange={(e) => updateFormData('subdomain', e.target.value)}
            placeholder="company"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Custom Domain"
            value={formData.customDomain}
            onChange={(e) => updateFormData('customDomain', e.target.value)}
            placeholder="app.company.com"
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Theme Settings
          </Typography>
          
          <TextField
            fullWidth
            label="Company Name"
            value={formData.theme.companyName}
            onChange={(e) => updateFormData('theme.companyName', e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Tagline"
            value={formData.theme.tagline}
            onChange={(e) => updateFormData('theme.tagline', e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Primary Color"
            value={formData.theme.primaryColor}
            onChange={(e) => updateFormData('theme.primaryColor', e.target.value)}
            type="color"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Secondary Color"
            value={formData.theme.secondaryColor}
            onChange={(e) => updateFormData('theme.secondaryColor', e.target.value)}
            type="color"
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Features
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(formData.features).map(([feature, enabled]) => (
              <Grid item xs={6} md={3} key={feature}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enabled}
                      onChange={(e) => updateFormData(`features.${feature}`, e.target.checked)}
                    />
                  }
                  label={feature.charAt(0).toUpperCase() + feature.slice(1)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Users"
                type="number"
                value={formData.settings.maxUsers}
                onChange={(e) => updateFormData('settings.maxUsers', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Storage"
                value={formData.settings.maxStorage}
                onChange={(e) => updateFormData('settings.maxStorage', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.customBranding}
                    onChange={(e) => updateFormData('settings.customBranding', e.target.checked)}
                  />
                }
                label="Custom Branding"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.whiteLabel}
                    onChange={(e) => updateFormData('settings.whiteLabel', e.target.checked)}
                  />
                }
                label="White Label"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TenantManagement;
