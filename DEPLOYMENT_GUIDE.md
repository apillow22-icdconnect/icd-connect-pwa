# 🚀 ICD Connect PWA - GitHub Pages Deployment Guide

## **Step 1: Prepare Your Repository**

### **1.1 Initialize Git Repository (if not already done)**
```bash
git init
git add .
git commit -m "Initial commit"
```

### **1.2 Create GitHub Repository**
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it: `icd-connect-pwa`
4. Make it **Public** (required for free GitHub Pages)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### **1.3 Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/icd-connect-pwa.git
git branch -M main
git push -u origin main
```

## **Step 2: Enable GitHub Pages**

### **2.1 Configure GitHub Pages**
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "gh-pages" branch
6. Click "Save"

### **2.2 Enable GitHub Actions**
1. In repository settings, go to "Actions" → "General"
2. Under "Actions permissions", select "Allow all actions and reusable workflows"
3. Click "Save"

## **Step 3: Configure Custom Domain (Optional)**

### **3.1 Add Custom Domain**
1. In repository settings → "Pages"
2. Under "Custom domain", enter your domain (e.g., `yourdomain.com`)
3. Click "Save"
4. Check "Enforce HTTPS" if available

### **3.2 Configure DNS Records**
Add these records to your domain provider (GoDaddy, etc.):

**For root domain:**
- **Type:** CNAME
- **Name:** @
- **Value:** `YOUR_USERNAME.github.io`

**For www subdomain:**
- **Type:** CNAME  
- **Name:** www
- **Value:** `YOUR_USERNAME.github.io`

## **Step 4: Automatic Deployment**

The GitHub Actions workflow will automatically:
1. Build your React app when you push to main branch
2. Deploy to GitHub Pages
3. Update your site at: `https://YOUR_USERNAME.github.io/icd-connect-pwa`

### **4.1 Manual Deployment (if needed)**
```bash
# Make changes and push
git add .
git commit -m "Update app"
git push origin main

# GitHub Actions will automatically deploy
```

## **Step 5: Access Your App**

### **5.1 Default URL**
Your app will be available at:
- `https://YOUR_USERNAME.github.io/icd-connect-pwa`

### **5.2 Custom Domain URL**
If you configured a custom domain:
- `https://yourdomain.com`

## **Step 6: Super Admin Access**

### **6.1 Login Credentials**
- **Email:** `superadmin@icd.com`
- **Password:** `superadmin123`

### **6.2 Access Tenant Management**
1. Visit your deployed app
2. Login as super admin
3. Click "Tenant Management" in navigation
4. Create new tenants for different businesses

## **Step 7: Create Business Tenants**

### **For Each Business:**

1. **Create New Tenant**
   - Click "Add Tenant"
   - Fill in business details:
     - **Name:** Business Name
     - **Domain:** `business.yourdomain.com` (if using custom domain)
     - **Theme:** Customize colors
     - **Features:** Enable/disable features

2. **Configure Subdomain (if using custom domain)**
   - Add CNAME record in your DNS provider:
     - **Name:** `business`
     - **Value:** `YOUR_USERNAME.github.io`

3. **Access Business App**
   - Visit: `https://business.yourdomain.com` (custom domain)
   - Or: `https://YOUR_USERNAME.github.io/icd-connect-pwa` (GitHub Pages)
   - Login with business admin credentials

## **Step 8: Environment Variables**

### **8.1 Add Repository Secrets (if needed)**
1. Go to repository settings → "Secrets and variables" → "Actions"
2. Add secrets for:
   - `CUSTOM_DOMAIN`: Your custom domain (if using one)

## **Troubleshooting**

### **Deployment Not Working?**
1. Check GitHub Actions tab for build errors
2. Verify the gh-pages branch was created
3. Check GitHub Pages settings

### **App Not Loading?**
1. Check if the gh-pages branch has the build files
2. Verify the repository is public
3. Check browser console for errors

### **Custom Domain Not Working?**
1. Verify DNS records are correct
2. Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
3. Wait 24-48 hours for DNS changes

### **Super Admin Login Issues?**
1. Verify you're on the correct URL
2. Check if tenant is properly configured
3. Try clearing browser cache

## **GitHub Pages Limitations**

- **Repository must be public** (for free tier)
- **No server-side functionality** (static hosting only)
- **API calls need separate backend** (consider using Netlify Functions or similar)

## **Next Steps**

1. Push your code to GitHub
2. Enable GitHub Pages
3. Configure custom domain (optional)
4. Test super admin access
5. Create business tenants
6. Customize themes and features

## **Support**

- **GitHub Pages Docs:** [pages.github.com](https://pages.github.com)
- **GitHub Actions Docs:** [docs.github.com/en/actions](https://docs.github.com/en/actions)
- **DNS Checker:** [whatsmydns.net](https://whatsmydns.net)

---

**Need Help?** Check the `PWA_ADMIN_GUIDE.html` file for detailed instructions!
