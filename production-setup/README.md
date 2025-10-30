# Production Setup Files

This folder contains all necessary files and scripts for setting up Budget Byahe in a production environment (Hostinger or any web hosting).

## 📁 Contents

### Setup Scripts
- **`setup-production.ps1`** - PowerShell script for Windows users
- **`setup-production.sh`** - Bash script for Linux/Mac users

### Environment Templates
- **`frontend.env.example`** - Frontend environment variables template
- **`backend.env.example`** - Backend environment variables template

## 🚀 Quick Setup

### For Windows Users

1. Open PowerShell as Administrator
2. Navigate to this folder:
   ```powershell
   cd production-setup
   ```
3. Run the setup script:
   ```powershell
   .\setup-production.ps1
   ```
4. Follow the prompts to enter your production URLs and database credentials

### For Linux/Mac Users

1. Open Terminal
2. Navigate to this folder:
   ```bash
   cd production-setup
   ```
3. Make the script executable:
   ```bash
   chmod +x setup-production.sh
   ```
4. Run the setup script:
   ```bash
   ./setup-production.sh
   ```
5. Follow the prompts to enter your production URLs and database credentials

## ⚙️ What the Scripts Do

The setup scripts will:
1. ✅ Create `.env.production` file for the frontend with your URLs
2. ✅ Create `.env.production` file for the backend with database credentials
3. ✅ Configure CORS settings for your production domain
4. ✅ Set up Firebase and API configurations
5. ✅ Update all necessary environment variables

## 📝 Manual Setup

If you prefer to set up manually:

### Frontend Configuration

1. Copy `frontend.env.example` to `../transpo-system-frontend/.env.production`
2. Update the following values:
   ```env
   REACT_APP_API_URL=https://api.your-domain.com
   REACT_APP_URL=https://your-domain.com
   REACT_APP_MAPBOX_TOKEN=your_mapbox_token
   REACT_APP_GROQ_API_KEY=your_groq_api_key
   ```

### Backend Configuration

1. Copy `backend.env.example` to `../transpo-system-backend/.env.production`
2. Update the following values:
   ```env
   APP_URL=https://api.your-domain.com
   FRONTEND_URL=https://your-domain.com
   
   DB_DATABASE=your_database_name
   DB_USERNAME=your_database_user
   DB_PASSWORD=your_database_password
   ```

## 🔒 Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env.production` files to version control
- Keep your API keys and database credentials secure
- Use different credentials for production and development
- Regenerate API keys if they are ever exposed

## 🌐 Production URLs

### Hostinger Setup
- **Frontend Domain:** budgetbyahe.com
- **Backend Subdomain:** api.budgetbyahe.com
- **Database Host:** Usually `localhost` on Hostinger

### Required Services
1. **Mapbox Account** - Get token at https://mapbox.com
2. **Groq API Key** - Get key at https://groq.com
3. **Firebase Project** - Set up at https://console.firebase.google.com

## 📚 Additional Documentation

For detailed deployment instructions, see:
- [Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)
- [Quick Deploy Reference](../docs/QUICK_DEPLOY_REFERENCE.md)
- [Hostinger Auth Fix](../docs/HOSTINGER_AUTH_FIX.md)

## 🆘 Troubleshooting

### Script Not Running
- **Windows:** Run PowerShell as Administrator
- **Linux/Mac:** Make sure script has execute permissions (`chmod +x`)

### Environment Files Not Created
- Check file paths in the script
- Ensure you have write permissions in the project directory

### API Keys Not Working
- Verify keys are correctly copied without extra spaces
- Check that keys are active and not expired
- Ensure domains are whitelisted in service dashboards

## 📞 Support

If you encounter issues:
1. Check the [troubleshooting guides](../docs/) in the docs folder
2. Review your Hostinger configuration
3. Verify Firebase settings and authorized domains
4. Contact the development team

---

**Last Updated:** October 30, 2025
