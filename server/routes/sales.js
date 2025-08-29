const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { users, messages } = require('../data/users');
const { getSales, addSale, updateSale, deleteSale, getSalesByUser } = require('../data/sales');
const { v4: uuidv4 } = require('uuid');

// Function to send automated bonus notification to admin
const sendBonusNotification = (user, totalSales) => {
  try {
    // Find admin users
    const adminUsers = users.filter(u => u.role === 'admin');
    
    adminUsers.forEach(admin => {
      const bonusMessage = {
        id: uuidv4(),
        content: `🎉 BONUS ACHIEVED! ${user.name} (${user.position}) has reached the 15-sales bonus target! Total sales: ${totalSales}`,
        senderId: 'system',
        senderName: 'System Notification',
        recipientId: admin.id,
        isGroupMessage: false,
        teamId: user.teamId,
        timestamp: new Date().toISOString(),
        isSystemMessage: true
      };
      
      messages.push(bonusMessage);
    });
    
    console.log(`Bonus notification sent for ${user.name} with ${totalSales} total sales`);
  } catch (error) {
    console.error('Error sending bonus notification:', error);
  }
};

// Get user's own sales with stats
router.get('/my-sales', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userSales = getSalesByUser(userId);
    
    // Calculate stats
    const totalSalesCount = userSales.reduce((sum, sale) => sum + sale.salesCount, 0);
    const totalSales = userSales.length;
    const averageSale = totalSales > 0 ? totalSalesCount / totalSales : 0;
    
    // Calculate this week's sales
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const thisWeek = userSales
      .filter(sale => new Date(sale.date) >= startOfWeek)
      .reduce((sum, sale) => sum + sale.salesCount, 0);
    
    // Calculate this month's sales
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = userSales
      .filter(sale => new Date(sale.date) >= startOfMonth)
      .reduce((sum, sale) => sum + sale.salesCount, 0);
    
    res.json({
      sales: userSales.sort((a, b) => new Date(b.date) - new Date(a.date)),
      stats: {
        totalSales: totalSalesCount,
        totalAmount: totalSalesCount,
        averageSale: Math.round(averageSale * 100) / 100,
        thisWeek,
        thisMonth
      }
    });
  } catch (error) {
    console.error('Error fetching user sales:', error);
    res.status(500).json({ message: 'Error fetching sales data' });
  }
});

// Add a new sale (for reps, team leaders, and campaign managers)
router.post('/', auth, requireRole(['admin', 'team_leader', 'campaign_manager', 'rep']), async (req, res) => {
  try {
    const { salesCount, description, date, type } = req.body;
    const userId = req.user.id;
    
    if (!salesCount || !description || !date || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const newSale = addSale({
      userId,
      salesCount: parseInt(salesCount),
      description,
      date,
      type
    });
    
    // Check if this sale puts the user over the 15-sales bonus threshold
    const userSales = getSalesByUser(userId);
    const totalSalesCount = userSales.reduce((sum, sale) => sum + sale.salesCount, 0);
    
    // Check if user just hit the bonus (was below 15, now at or above 15)
    const previousTotal = totalSalesCount - parseInt(salesCount);
    const currentTotal = totalSalesCount;
    
    if (previousTotal < 15 && currentTotal >= 15) {
      // User just hit the bonus! Send notification to admin
      const user = users.find(u => u.id === userId);
      if (user && (user.role === 'rep' || user.role === 'team_leader' || user.role === 'campaign_manager')) {
        sendBonusNotification(user, currentTotal);
      }
    }
    
    res.status(201).json({
      message: 'Sale logged successfully',
      sale: newSale,
      bonusAchieved: previousTotal < 15 && currentTotal >= 15
    });
  } catch (error) {
    console.error('Error adding sale:', error);
    res.status(500).json({ message: 'Error adding sale' });
  }
});

// Update a sale (only the owner can update their own sales)
router.put('/:saleId', auth, async (req, res) => {
  try {
    const saleId = parseInt(req.params.saleId);
    const { salesCount, description, date, type } = req.body;
    const userId = req.user.id;
    
    const allSales = getSales();
    const sale = allSales.find(sale => sale.id === saleId);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    // Only the owner or admin can update the sale
    if (sale.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this sale' });
    }
    
    if (!salesCount || !description || !date || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const updatedSale = updateSale(saleId, {
      salesCount: parseInt(salesCount),
      description,
      date,
      type
    });
    
    res.json({
      message: 'Sale updated successfully',
      sale: updatedSale
    });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ message: 'Error updating sale' });
  }
});

// Delete a sale (only the owner or admin can delete)
router.delete('/:saleId', auth, async (req, res) => {
  try {
    const saleId = parseInt(req.params.saleId);
    const userId = req.user.id;
    
    const allSales = getSales();
    const sale = allSales.find(sale => sale.id === saleId);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    // Only the owner or admin can delete the sale
    if (sale.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this sale' });
    }
    
    const success = deleteSale(saleId);
    
    if (success) {
      res.json({ message: 'Sale deleted successfully' });
    } else {
      res.status(500).json({ message: 'Error deleting sale' });
    }
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ message: 'Error deleting sale' });
  }
});

// Get all sales (admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const allSales = getSales();
    const salesWithUserInfo = allSales.map(sale => {
      const user = users.find(u => u.id === sale.userId);
      return {
        ...sale,
        userName: user ? user.name : 'Unknown User',
        userRole: user ? user.role : 'Unknown'
      };
    });
    
    res.json({
      sales: salesWithUserInfo.sort((a, b) => new Date(b.date) - new Date(a.date))
    });
  } catch (error) {
    console.error('Error fetching all sales:', error);
    res.status(500).json({ message: 'Error fetching sales data' });
  }
});

module.exports = router;
