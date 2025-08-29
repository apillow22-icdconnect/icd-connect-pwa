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
  ListItemSecondaryAction,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';

const SalesTracker = () => {
  const [sales, setSales] = useState([]);
  const [addSaleDialogOpen, setAddSaleDialogOpen] = useState(false);
  const [editSaleDialogOpen, setEditSaleDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleData, setSaleData] = useState({
    salesCount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'daily' // daily or weekly
  });
  const [loading, setLoading] = useState(false);
  const [bonusAchieved, setBonusAchieved] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAmount: 0,
    averageSale: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/sales/my-sales', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(response.data.sales);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const handleAddSale = async () => {
    if (!saleData.salesCount || !saleData.description) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/sales', saleData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if bonus was achieved
      if (response.data.bonusAchieved) {
        setBonusAchieved(true);
        setTimeout(() => setBonusAchieved(false), 5000); // Hide after 5 seconds
      }
      
      setSaleData({
        salesCount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'daily'
      });
      setAddSaleDialogOpen(false);
      fetchSales();
    } catch (error) {
      console.error('Error adding sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSale = async () => {
    if (!saleData.salesCount || !saleData.description) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/sales/${selectedSale.id}`, saleData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditSaleDialogOpen(false);
      setSelectedSale(null);
      setSaleData({
        salesCount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'daily'
      });
      fetchSales();
    } catch (error) {
      console.error('Error updating sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const openEditDialog = (sale) => {
    setSelectedSale(sale);
    setSaleData({
      salesCount: sale.salesCount.toString(),
      description: sale.description,
      date: sale.date,
      type: sale.type
    });
    setEditSaleDialogOpen(true);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type) => {
    return type === 'weekly' ? 'primary' : 'success';
  };

  const getTypeIcon = (type) => {
    return type === 'weekly' ? <CalendarIcon /> : <MoneyIcon />;
  };

  return (
    <Box sx={{ p: 3, pt: 6, maxWidth: 1200, mx: 'auto' }}>
      {/* Bonus Achievement Notification */}
      {bonusAchieved && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            fontSize: '1.1rem',
            '& .MuiAlert-message': { fontSize: '1.1rem' }
          }}
          onClose={() => setBonusAchieved(false)}
        >
          🎉 CONGRATULATIONS! You've achieved the 15-sales bonus target! Admin has been notified.
        </Alert>
      )}
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          📊 My Sales Tracker
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddSaleDialogOpen(true)}
          sx={{
            px: 3,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: 3
          }}
        >
          💰 Log New Sale
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', bgcolor: 'primary.light', color: 'white', py: 1 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                📊 Total Sales
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {formatNumber(stats.totalSales)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'white', py: 1 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                📈 Sales Today
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {stats.totalSales}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', bgcolor: 'info.light', color: 'white', py: 1 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                📊 Average Per Day
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {formatNumber(stats.averageSale)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'white', py: 1 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                📅 Sales This Week
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {formatNumber(stats.thisWeek)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', bgcolor: 'secondary.light', color: 'white', py: 1 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                🗓️ Sales This Month
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {formatNumber(stats.thisMonth)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            textAlign: 'center', 
            bgcolor: stats.totalSales >= 15 ? 'success.main' : 'grey.300', 
            color: 'white', 
            py: 1,
            border: stats.totalSales >= 15 ? '3px solid #FFD700' : 'none',
            boxShadow: stats.totalSales >= 15 ? '0 4px 20px rgba(255, 215, 0, 0.3)' : 'none'
          }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                🎯 Bonus Target
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {stats.totalSales >= 15 ? '🎉 ACHIEVED!' : `${stats.totalSales}/15`}
              </Typography>
              {stats.totalSales >= 15 && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  🏆 Bonus Unlocked!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales List */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            📋 My Sales History
          </Typography>
          
          {sales.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No sales logged yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start tracking your sales by logging your first sale!
              </Typography>
            </Box>
          ) : (
            <List>
              {sales.map((sale, index) => (
                <React.Fragment key={sale.id}>
                  <ListItem sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                      <Box sx={{ mr: 2 }}>
                        <Chip
                          icon={getTypeIcon(sale.type)}
                          label={sale.type === 'weekly' ? 'Weekly' : 'Daily'}
                          color={getTypeColor(sale.type)}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {sale.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(sale.date)}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main', mr: 2 }}>
                        {formatNumber(sale.salesCount)} sales
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(sale)}
                        sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.main' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSale(sale.id)}
                        color="error"
                        sx={{ 
                          bgcolor: 'error.light', 
                          color: 'white',
                          '&:hover': { bgcolor: 'error.main' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < sales.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add Sale Dialog */}
      <Dialog 
        open={addSaleDialogOpen} 
        onClose={() => setAddSaleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            maxHeight: '95vh',
            height: 'auto',
            minHeight: '400px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #e0e0e0' }}>
          💰 Log New Sale
        </DialogTitle>
        <DialogContent sx={{
          pt: 2,
          pb: 2,
          overflow: 'visible',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#90caf9', borderRadius: '8px' },
          '&::-webkit-scrollbar-track': { backgroundColor: '#e3f2fd' }
        }}>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Number of Sales"
                  type="number"
                  value={saleData.salesCount}
                  onChange={(e) => setSaleData({ ...saleData, salesCount: e.target.value })}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>#</Typography>
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Campaign"
                  value={saleData.description}
                  onChange={(e) => setSaleData({ ...saleData, description: e.target.value })}
                  placeholder="e.g., Summer Campaign, Holiday Special, Product Launch"
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={saleData.date}
                  onChange={(e) => setSaleData({ ...saleData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Sale Type"
                  value={saleData.type}
                  onChange={(e) => setSaleData({ ...saleData, type: e.target.value })}
                  sx={{ mb: 2 }}
                >
                  <option value="daily">Daily Sale</option>
                  <option value="weekly">Weekly Sale</option>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setAddSaleDialogOpen(false)}
            variant="outlined"
            sx={{ px: 3 }}
          >
            ❌ Cancel
          </Button>
          <Button
            onClick={handleAddSale}
            variant="contained"
            disabled={loading || !saleData.salesCount || !saleData.description}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            {loading ? '🔄 Adding...' : '✅ Add Sale'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog 
        open={editSaleDialogOpen} 
        onClose={() => setEditSaleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh', overflow: 'hidden', mt: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #e0e0e0' }}>
          ✏️ Edit Sale
        </DialogTitle>
        <DialogContent sx={{
          pt: 2,
          height: '70vh',
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#90caf9', borderRadius: '8px' },
          '&::-webkit-scrollbar-track': { backgroundColor: '#e3f2fd' }
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Number of Sales"
                type="number"
                value={saleData.salesCount}
                onChange={(e) => setSaleData({ ...saleData, salesCount: e.target.value })}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>#</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign"
                value={saleData.description}
                onChange={(e) => setSaleData({ ...saleData, description: e.target.value })}
                placeholder="e.g., Summer Campaign, Holiday Special, Product Launch"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={saleData.date}
                onChange={(e) => setSaleData({ ...saleData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Sale Type"
                value={saleData.type}
                onChange={(e) => setSaleData({ ...saleData, type: e.target.value })}
              >
                <option value="daily">Daily Sale</option>
                <option value="weekly">Weekly Sale</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setEditSaleDialogOpen(false)}
            variant="outlined"
            sx={{ px: 3 }}
          >
            ❌ Cancel
          </Button>
          <Button
            onClick={handleEditSale}
            variant="contained"
            disabled={loading || !saleData.salesCount || !saleData.description}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            {loading ? '🔄 Updating...' : '✅ Update Sale'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesTracker;
