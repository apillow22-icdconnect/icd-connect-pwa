// Shared sales data for leaderboard and sales tracker
let sales = [
  {
    id: 1,
    userId: 2, // Sarah Johnson (Team Leader)
    salesCount: 5,
    description: 'Product demo and follow-up sales',
    date: '2024-01-15',
    type: 'daily',
    createdAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: 2,
    userId: 3, // Mike Chen (Sales Rep)
    salesCount: 3,
    description: 'Client meeting and contract signings',
    date: '2024-01-15',
    type: 'daily',
    createdAt: new Date('2024-01-15T14:30:00Z')
  },
  {
    id: 3,
    userId: 4, // Lisa Rodriguez (Sales Rep)
    salesCount: 8,
    description: 'Weekly team presentation and sales',
    date: '2024-01-14',
    type: 'weekly',
    createdAt: new Date('2024-01-14T09:15:00Z')
  },
  {
    id: 4,
    userId: 2, // Sarah Johnson (Team Leader)
    salesCount: 4,
    description: 'Follow-up call and additional sales',
    date: '2024-01-14',
    type: 'daily',
    createdAt: new Date('2024-01-14T16:45:00Z')
  },
  {
    id: 5,
    userId: 3, // Mike Chen (Sales Rep)
    salesCount: 6,
    description: 'New client acquisitions',
    date: '2024-01-13',
    type: 'daily',
    createdAt: new Date('2024-01-13T11:20:00Z')
  }
];

// Helper functions for sales data manipulation
const getSales = () => sales;

const addSale = (sale) => {
  const newSale = {
    ...sale,
    id: sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1,
    createdAt: new Date()
  };
  sales.push(newSale);
  return newSale;
};

const updateSale = (saleId, updates) => {
  const saleIndex = sales.findIndex(sale => sale.id === saleId);
  if (saleIndex === -1) return null;
  
  sales[saleIndex] = {
    ...sales[saleIndex],
    ...updates,
    updatedAt: new Date()
  };
  return sales[saleIndex];
};

const deleteSale = (saleId) => {
  const saleIndex = sales.findIndex(sale => sale.id === saleId);
  if (saleIndex === -1) return false;
  
  sales.splice(saleIndex, 1);
  return true;
};

const getSalesByUser = (userId) => {
  return sales.filter(sale => sale.userId === userId);
};

const getSalesByDateRange = (startDate, endDate) => {
  return sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= startDate && saleDate <= endDate;
  });
};

module.exports = {
  getSales,
  addSale,
  updateSale,
  deleteSale,
  getSalesByUser,
  getSalesByDateRange
};
