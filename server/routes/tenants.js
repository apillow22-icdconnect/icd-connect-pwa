const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { 
  getTenantByDomain, 
  createTenant, 
  updateTenant, 
  deleteTenant, 
  getAllTenants, 
  isDomainAvailable 
} = require('../data/tenants');

const router = express.Router();

// Get current tenant info
router.get('/current', (req, res) => {
  try {
    const hostname = req.get('host') || req.hostname;
    const tenant = getTenantByDomain(hostname);
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tenants (Super Admin only)
router.get('/', auth, requireRole(['super_admin']), (req, res) => {
  try {
    const tenants = getAllTenants();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new tenant (Super Admin only)
router.post('/', auth, requireRole(['super_admin']), (req, res) => {
  try {
    const {
      name,
      domain,
      subdomain,
      customDomain,
      theme,
      features,
      settings
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Tenant name is required' });
    }
    
    // Check if domain/subdomain is available
    if (!isDomainAvailable(domain, subdomain, customDomain)) {
      return res.status(400).json({ 
        message: 'Domain, subdomain, or custom domain is already in use' 
      });
    }
    
    const newTenant = createTenant({
      name,
      domain,
      subdomain,
      customDomain,
      theme,
      features,
      settings
    });
    
    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: newTenant
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tenant (Super Admin or Tenant Admin)
router.put('/:tenantId', auth, requireRole(['super_admin', 'admin']), (req, res) => {
  try {
    const { tenantId } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated
    delete updates.id;
    delete updates.createdAt;
    delete updates.status;
    
    const updatedTenant = updateTenant(tenantId, updates);
    
    if (!updatedTenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    res.json({
      message: 'Tenant updated successfully',
      tenant: updatedTenant
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tenant (Super Admin only)
router.delete('/:tenantId', auth, requireRole(['super_admin']), (req, res) => {
  try {
    const { tenantId } = req.params;
    
    if (tenantId === 'default') {
      return res.status(400).json({ message: 'Cannot delete default tenant' });
    }
    
    const deleted = deleteTenant(tenantId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check domain availability
router.post('/check-domain', auth, requireRole(['super_admin']), (req, res) => {
  try {
    const { domain, subdomain, customDomain } = req.body;
    
    const available = isDomainAvailable(domain, subdomain, customDomain);
    
    res.json({ available });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
