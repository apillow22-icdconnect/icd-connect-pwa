const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { users } = require('../data/users');
const { getSales, addSale, updateSale, deleteSale } = require('../data/sales');

// Get leaderboard data (aggregated sales by user)
router.get('/', auth, async (req, res) => {
  try {
    const allSales = getSales();
    const leaderboard = users
      .filter(user => user.role === 'team_leader' || user.role === 'campaign_manager' || user.role === 'rep')
      .map(user => {
        const userSales = allSales.filter(sale => sale.userId === user.id);
        const totalSales = userSales.reduce((sum, sale) => sum + sale.salesCount, 0);
        const salesCount = userSales.length;
        const averageSale = salesCount > 0 ? totalSales / salesCount : 0;
        
        return {
          id: user.id,
          name: user.name,
          role: user.role,
          totalSales,
          salesCount,
          averageSale
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard data' });
  }
});

// Get sales for a specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const allSales = getSales();
    
    const userSales = allSales
      .filter(sale => sale.userId === userId)
      .map(sale => ({
        ...sale,
        userName: users.find(u => u.id === sale.userId)?.name || 'Unknown'
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(userSales);
  } catch (error) {
    console.error('Error fetching user sales:', error);
    res.status(500).json({ message: 'Error fetching user sales' });
  }
});

// Add a new sale
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { salesCount, description, date, userId } = req.body;
    
    if (!salesCount || !description || !date) {
      return res.status(400).json({ message: 'Sales count, description, and date are required' });
    }

    // If userId is not provided, use the current user's ID
    const saleUserId = userId || req.user.id;
    
    const newSale = addSale({
      userId: saleUserId,
      salesCount: parseInt(salesCount),
      description,
      date,
      type: 'daily' // Default type for admin-added sales
    });
    
    res.status(201).json({ 
      message: 'Sale added successfully',
      saleId: newSale.id 
    });
  } catch (error) {
    console.error('Error adding sale:', error);
    res.status(500).json({ message: 'Error adding sale' });
  }
});

// Update a sale
router.put('/:saleId', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { saleId } = req.params;
    const { salesCount, description, date } = req.body;
    
    if (!salesCount || !description || !date) {
      return res.status(400).json({ message: 'Sales count, description, and date are required' });
    }
    
    const updatedSale = updateSale(parseInt(saleId), {
      salesCount: parseInt(salesCount),
      description,
      date
    });
    
    if (!updatedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json({ message: 'Sale updated successfully' });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ message: 'Error updating sale' });
  }
});

// Delete a sale
router.delete('/:saleId', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { saleId } = req.params;
    
    const success = deleteSale(parseInt(saleId));
    if (!success) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ message: 'Error deleting sale' });
  }
});

// Get sales statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const allSales = getSales();
    const recentSales = allSales.filter(sale => new Date(sale.date) >= thirtyDaysAgo);
    
    const stats = {
      activeSellers: new Set(recentSales.map(sale => sale.userId)).size,
      totalSales: recentSales.length,
      totalRevenue: recentSales.reduce((sum, sale) => sum + sale.salesCount, 0),
      averageSale: recentSales.length > 0 ? recentSales.reduce((sum, sale) => sum + sale.salesCount, 0) / recentSales.length : 0,
      highestSale: recentSales.length > 0 ? Math.max(...recentSales.map(sale => sale.salesCount)) : 0,
      lowestSale: recentSales.length > 0 ? Math.min(...recentSales.map(sale => sale.salesCount)) : 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ message: 'Error fetching sales statistics' });
  }
});

// Get monthly sales breakdown
router.get('/stats/monthly', auth, async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const allSales = getSales();
    const recentSales = allSales.filter(sale => new Date(sale.date) >= twelveMonthsAgo);
    
    const monthlyStats = {};
    
    recentSales.forEach(sale => {
      const month = new Date(sale.date).toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          month,
          salesCount: 0,
          totalRevenue: 0,
          averageSale: 0
        };
      }
      monthlyStats[month].salesCount++;
      monthlyStats[month].totalRevenue += sale.salesCount;
    });
    
    // Calculate averages
    Object.values(monthlyStats).forEach(stat => {
      stat.averageSale = stat.salesCount > 0 ? stat.totalRevenue / stat.salesCount : 0;
    });
    
    const result = Object.values(monthlyStats).sort((a, b) => b.month.localeCompare(a.month));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ message: 'Error fetching monthly statistics' });
  }
});

module.exports = router;
