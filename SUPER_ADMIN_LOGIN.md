# 🔑 Super Admin Login Guide

## Quick Access Information

### Login Credentials
- **Email**: `superadmin@icd.com`
- **Password**: `superadmin123`

### How to Access

1. **Start the Application**
   ```bash
   # Terminal 1 - Start Backend Server
   npm run server
   
   # Terminal 2 - Start Frontend Client
   cd client && npm start
   ```

2. **Open Browser**
   - Navigate to: `http://localhost:3000`

3. **Login as Super Admin**
   - Enter Email: `superadmin@icd.com`
   - Enter Password: `superadmin123`
   - Click "Login"

4. **Access Tenant Management**
   - After login, you'll see the dashboard
   - Click "Tenant Management" in the navigation menu
   - This is where you can create and manage business tenants

### Super Admin Capabilities

✅ **Create New Business Tenants**
- Add new companies to the platform
- Configure custom domains and subdomains
- Set up branding and themes

✅ **Manage All Tenants**
- View all businesses in the system
- Edit tenant configurations
- Enable/disable features per business

✅ **System Administration**
- Monitor platform usage
- Manage user permissions
- Configure system-wide settings

### Quick Start Steps

1. **Login** with super admin credentials
2. **Go to Tenant Management** from the navigation
3. **Click "Add Tenant"** to create a new business
4. **Configure the tenant** with:
   - Business name and branding
   - Domain/subdomain settings
   - Feature permissions
   - User limits
5. **Save the tenant** configuration
6. **Create admin account** for the business
7. **Business can now access** their customized platform

### Troubleshooting

**If login fails:**
- Make sure both server and client are running
- Check that the server is on port 5001
- Verify the client is on port 3000
- Clear browser cache and try again

**If Tenant Management doesn't appear:**
- Ensure you're logged in as super admin
- Check that the user role is `super_admin`
- Refresh the page and try again

---

**📱 PDF Guide**: The complete PWA Admin Guide has been saved as `PWA_Admin_Guide.pdf` on your Desktop for detailed instructions.
