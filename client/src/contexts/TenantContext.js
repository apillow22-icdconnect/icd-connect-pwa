import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTenantInfo();
  }, []);

  const fetchTenantInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tenants/current');
      setTenant(response.data);
      
      // Apply theme to document
      applyTheme(response.data.theme);
    } catch (error) {
      console.log('Tenant fetch failed, using default tenant');
      // Use default tenant for demo
      const defaultTenant = {
        id: 1,
        domain: 'icdconnect.com',
        name: 'ICD Connect',
        theme: {
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          companyName: 'ICD Connect',
          tagline: 'Smart Circle Management Platform'
        },
        features: {
          messaging: true,
          scheduling: true,
          training: true,
          tests: true,
          leaderboard: true,
          stars: true
        }
      };
      setTenant(defaultTenant);
      applyTheme(defaultTenant.theme);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme) => {
    // Apply CSS custom properties for theming
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    
    // Update document title
    document.title = theme.companyName || 'ICD Connect';
    
    // Update favicon if provided
    if (theme.favicon) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = theme.favicon;
      }
    }
  };

  const updateTenant = async (updates) => {
    try {
      const response = await axios.put(`/api/tenants/${tenant.id}`, updates);
      setTenant(response.data.tenant);
      
      // Re-apply theme if theme was updated
      if (updates.theme) {
        applyTheme(response.data.tenant.theme);
      }
      
      return response.data;
    } catch (error) {
      console.log('Tenant update failed, using local update');
      // For demo, update locally
      const updatedTenant = { ...tenant, ...updates };
      setTenant(updatedTenant);
      if (updates.theme) {
        applyTheme(updatedTenant.theme);
      }
      return { success: true };
    }
  };

  const isFeatureEnabled = (featureName) => {
    if (!tenant) return true; // Default to enabled if tenant not loaded
    return tenant.features[featureName] !== false;
  };

  const getTheme = () => {
    return tenant?.theme || {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      companyName: 'ICD Connect',
      tagline: 'Smart Circle Management Platform'
    };
  };

  const value = {
    tenant,
    loading,
    error,
    updateTenant,
    isFeatureEnabled,
    getTheme,
    refreshTenant: fetchTenantInfo
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
