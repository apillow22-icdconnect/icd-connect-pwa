// Multi-tenant system for different businesses
let tenants = [
  {
    id: 'default',
    name: 'ICD Connect',
    domain: 'localhost',
    subdomain: null,
    customDomain: null,
    theme: {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      logo: '/logo192.png',
      favicon: '/favicon.ico',
      companyName: 'ICD Connect',
      tagline: 'Smart Circle Management Platform'
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
    },
    createdAt: new Date().toISOString(),
    status: 'active'
  }
];

// Get tenant by domain or subdomain
const getTenantByDomain = (hostname) => {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0];
  
  // Check for custom domain first
  const customDomainTenant = tenants.find(tenant => 
    tenant.customDomain === cleanHostname
  );
  if (customDomainTenant) return customDomainTenant;
  
  // Check for subdomain
  const subdomainTenant = tenants.find(tenant => 
    tenant.subdomain && cleanHostname.startsWith(tenant.subdomain + '.')
  );
  if (subdomainTenant) return subdomainTenant;
  
  // Check for exact domain match
  const domainTenant = tenants.find(tenant => 
    tenant.domain === cleanHostname
  );
  if (domainTenant) return domainTenant;
  
  // Return default tenant
  return tenants.find(tenant => tenant.id === 'default');
};

// Create new tenant
const createTenant = (tenantData) => {
  const newTenant = {
    id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: tenantData.name,
    domain: tenantData.domain || null,
    subdomain: tenantData.subdomain || null,
    customDomain: tenantData.customDomain || null,
    theme: {
      primaryColor: tenantData.theme?.primaryColor || '#1976d2',
      secondaryColor: tenantData.theme?.secondaryColor || '#dc004e',
      logo: tenantData.theme?.logo || '/logo192.png',
      favicon: tenantData.theme?.favicon || '/favicon.ico',
      companyName: tenantData.theme?.companyName || tenantData.name,
      tagline: tenantData.theme?.tagline || 'Smart Circle Management Platform'
    },
    features: {
      messaging: tenantData.features?.messaging !== false,
      training: tenantData.features?.training !== false,
      tests: tenantData.features?.tests !== false,
      leaderboard: tenantData.features?.leaderboard !== false,
      salesTracker: tenantData.features?.salesTracker !== false,
      stars: tenantData.features?.stars !== false,
      schedules: tenantData.features?.schedules !== false
    },
    settings: {
      maxUsers: tenantData.settings?.maxUsers || 100,
      maxStorage: tenantData.settings?.maxStorage || '1GB',
      customBranding: tenantData.settings?.customBranding || false,
      whiteLabel: tenantData.settings?.whiteLabel || false
    },
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  tenants.push(newTenant);
  return newTenant;
};

// Update tenant
const updateTenant = (tenantId, updates) => {
  const tenantIndex = tenants.findIndex(tenant => tenant.id === tenantId);
  if (tenantIndex === -1) return null;
  
  tenants[tenantIndex] = {
    ...tenants[tenantIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return tenants[tenantIndex];
};

// Delete tenant
const deleteTenant = (tenantId) => {
  const tenantIndex = tenants.findIndex(tenant => tenant.id === tenantId);
  if (tenantIndex === -1) return false;
  
  tenants.splice(tenantIndex, 1);
  return true;
};

// Get all tenants
const getAllTenants = () => {
  return tenants;
};

// Check if domain/subdomain is available
const isDomainAvailable = (domain, subdomain, customDomain) => {
  return !tenants.some(tenant => 
    (tenant.domain === domain && domain !== null) ||
    (tenant.subdomain === subdomain && subdomain !== null) ||
    (tenant.customDomain === customDomain && customDomain !== null)
  );
};

module.exports = {
  tenants,
  getTenantByDomain,
  createTenant,
  updateTenant,
  deleteTenant,
  getAllTenants,
  isDomainAvailable
};
