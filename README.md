# 🚀 ICD Connect PWA

A comprehensive Progressive Web App (PWA) for Smart Circle Independent Contract Distributors, featuring training, communication, sales tracking, and team management capabilities.

## 🌟 Features

- **Multi-tenant Architecture**: Support for multiple businesses with custom themes
- **Training Management**: Interactive training modules and progress tracking
- **Sales Tracking**: Real-time sales data and leaderboards
- **Communication Hub**: Team messaging and notifications
- **Schedule Management**: Interactive calendar and shift assignments
- **Star Reward System**: Gamified performance tracking
- **PWA Capabilities**: Offline support, push notifications, app-like experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/icd-connect-pwa.git
cd icd-connect-pwa

# Install dependencies
npm run install-all

# Start development server
npm run dev
```

### Development
```bash
# Start both client and server
npm run dev

# Start only server
npm run server

# Start only client
npm run client

# Build for production
npm run build
```

## 🌐 Deployment

This app is configured for **GitHub Pages** deployment with automatic CI/CD.

### Automatic Deployment
1. Push code to `main` branch
2. GitHub Actions automatically builds and deploys
3. App available at: `https://YOUR_USERNAME.github.io/icd-connect-pwa`

### Manual Deployment
```bash
# Run deployment script
./deploy-github-pages.sh

# Push to GitHub
git add .
git commit -m "Update app"
git push origin main
```

📚 **See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions**

## 🔐 Super Admin Access

- **Email:** `superadmin@icd.com`
- **Password:** `superadmin123`

## 🏗️ Architecture

```
ICD/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── data/              # Data storage
│   └── middleware/        # Auth middleware
└── .github/workflows/     # GitHub Actions
```

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Push Notifications**: Real-time updates
- **App-like Experience**: Installable on devices
- **Responsive Design**: Works on all screen sizes

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
```

### Custom Domain
1. Add custom domain in GitHub repository settings
2. Configure DNS records to point to GitHub Pages
3. Update CNAME file in repository

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [PWA Admin Guide](PWA_ADMIN_GUIDE.md)
- [Enhanced Calendar Features](ENHANCED_CALENDAR_FEATURES.md)
- [User Management Guide](USER_MANAGEMENT_ADDED.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation files
- Review deployment guide
- Check GitHub Issues

---

**Built with ❤️ for Smart Circle ICD**
