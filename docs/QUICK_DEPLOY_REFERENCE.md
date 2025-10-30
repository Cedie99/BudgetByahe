# 🚀 Quick Deployment Reference

## For Hostinger Deployment

### 📋 Pre-Deployment Checklist

- [ ] Hostinger account ready
- [ ] Domain configured and SSL installed
- [ ] Database created in Hostinger
- [ ] Firebase project setup complete
- [ ] Git repository up to date

---

## 🔧 Step 1: Configure Production Settings

### Option A: Use Setup Script (Recommended)

**Windows:**
```powershell
.\setup-production.ps1
```

**Linux/Mac:**
```bash
chmod +x setup-production.sh
./setup-production.sh
```

### Option B: Manual Configuration

1. **Frontend** - Create `transpo-system-frontend/.env.production`:
```env
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_URL=https://www.your-domain.com
REACT_APP_MAPBOX_TOKEN=your_token
REACT_APP_GROQ_API_KEY=your_key
NODE_ENV=production
```

2. **Backend** - Create `transpo-system-backend/.env` on server:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.your-domain.com
FRONTEND_URL=https://www.your-domain.com
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_pass
```

---

## 📦 Step 2: Build Frontend

```bash
cd transpo-system-frontend
npm install
npm run build
```

**Output**: `build/` folder ready to upload

---

## 📤 Step 3: Upload Files

### Frontend (Hostinger File Manager or FTP)

Upload contents of `build/` folder to:
```
/public_html/
```

**Important**: Upload contents, NOT the build folder itself!

### Backend

Upload entire `transpo-system-backend/` folder to:
```
/public_html/api/
```

Or use subdomain: `api.your-domain.com`

---

## 🗄️ Step 4: Database Setup

1. Create database in Hostinger cPanel
2. Note credentials
3. SSH into server or use terminal:

```bash
cd /path/to/backend
php artisan migrate --force
```

---

## 🔐 Step 5: Configure Laravel

```bash
# SSH into your server
cd /path/to/backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Generate key if needed
php artisan key:generate

# Cache configs
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 755 storage bootstrap/cache
```

---

## ✅ Step 6: Verify Deployment

### Test Backend
```
Visit: https://api.your-domain.com
```

### Test Frontend
```
Visit: https://www.your-domain.com
```

### Test API Connection
- Open browser console (F12)
- Navigate site
- Check Network tab for API calls
- Verify no CORS errors

---

## 🐛 Quick Troubleshooting

### CORS Error?
```bash
# Backend .env
FRONTEND_URL=https://www.your-domain.com

# Then cache
php artisan config:cache
```

### 404 on Routes?
- Check `.htaccess` in public_html/
- Verify all build files uploaded
- Enable mod_rewrite

### API Not Connecting?
- Check `REACT_APP_API_URL` in frontend
- Verify backend is running
- Test backend URL directly

### Database Error?
- Verify credentials in backend `.env`
- Check database exists
- Run migrations

---

## 📞 Emergency Commands

### Clear All Caches (Laravel)
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Rebuild Frontend
```bash
rm -rf build node_modules
npm install
npm run build
```

### Fix Permissions
```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

---

## 📝 Important Files

### Must Be Present on Server

**Frontend:**
- `index.html`
- `.htaccess` (for React routing)
- `static/` folder
- `manifest.json`

**Backend:**
- `.env` (with production settings)
- `storage/` folder (writable)
- `public/` folder
- `vendor/` folder

### Must NOT Upload

- `node_modules/`
- `.git/`
- `.env` (from local)
- `build/` folder itself (only contents)

---

## 🔗 Useful Links

- **Frontend**: https://www.your-domain.com
- **Backend API**: https://api.your-domain.com
- **Admin Panel**: https://www.your-domain.com/admin/login
- **cPanel**: https://hpanel.hostinger.com

---

## 📋 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] All pages navigate properly
- [ ] Login/Signup works
- [ ] Admin panel accessible
- [ ] Firebase authentication works
- [ ] API calls successful (check console)
- [ ] Images and assets load
- [ ] CMS updates reflect on site
- [ ] SSL certificate active
- [ ] No console errors

---

## 🆘 Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed steps
2. Check `DYNAMIC_CONFIG_SUMMARY.md` for how it works
3. Review browser console errors
4. Check Laravel logs: `storage/logs/laravel.log`
5. Contact Hostinger support for server issues

---

## 🎉 Success Indicators

✅ Frontend loads without errors  
✅ Backend API responds  
✅ No CORS errors in console  
✅ Login/authentication works  
✅ Admin panel accessible  
✅ Firebase connected  
✅ SSL certificate installed  

---

**Quick Reference Version 1.0**  
**Date**: October 30, 2025  
**For**: Budget Byahe - Hostinger Deployment
