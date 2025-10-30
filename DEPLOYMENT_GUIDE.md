# Deployment Guide for Hostinger

This guide will help you deploy Budget Byahe to Hostinger with proper environment configuration.

## 📋 Prerequisites

- Hostinger hosting account with:
  - PHP 8.0 or higher
  - MySQL database
  - Node.js support (for building React)
  - SSH access (recommended)
- Domain name configured
- Firebase project setup
- Database backup (if migrating)

---

## 🚀 Deployment Steps

### Part 1: Laravel Backend Deployment

#### 1. Prepare Your Backend Files

On your local machine:

```bash
cd transpo-system-backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

#### 2. Configure Production Environment

Create `.env` file on your production server with these settings:

```env
APP_NAME="Budget Byahe"
APP_ENV=production
APP_KEY=base64:8Fc0wXyeTdKgXO7DUXcGqH9UBn8Yoe8NDJPBXmDI3GU=
APP_DEBUG=false
APP_URL=https://api.your-domain.com

# UPDATE THIS WITH YOUR FRONTEND URL
FRONTEND_URL=https://www.your-domain.com

# Database credentials from Hostinger
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_hostinger_database
DB_USERNAME=your_hostinger_username
DB_PASSWORD=your_hostinger_password

# Other settings...
```

#### 3. Upload Backend Files

**Option A: Using File Manager**
1. Compress your `transpo-system-backend` folder
2. Upload to Hostinger File Manager
3. Extract in the desired location (usually `public_html/api` or separate subdomain)

**Option B: Using FTP/SFTP**
1. Connect via FileZilla or similar FTP client
2. Upload all files to your backend directory
3. Ensure `.env` file is uploaded

**Option C: Using SSH (Recommended)**
```bash
# Connect to your server
ssh username@your-server.com

# Clone or upload your files
# Then run:
cd /path/to/backend
composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan migrate --force
```

#### 4. Set Directory Permissions

```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

#### 5. Configure Web Server

**For Apache (.htaccess)** - Already included in Laravel

**Document Root**: Point to `/public_html/api/public` (or your backend's public folder)

#### 6. Upload Firebase Service Account

1. Upload `firebase-service-account.json` to `storage/` directory
2. Update `FIREBASE_CREDENTIALS` in `.env` to the correct path
3. Ensure file permissions are secure: `chmod 600 storage/firebase-service-account.json`

---

### Part 2: React Frontend Deployment

#### 1. Update Environment Variables

Create `.env.production` in your local `transpo-system-frontend` folder:

```env
# UPDATE THESE WITH YOUR ACTUAL HOSTINGER URLS
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_URL=https://www.your-domain.com

# Keep these from your .env file
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_GROQ_API_KEY=your_groq_api_key

NODE_ENV=production
```

#### 2. Build React Application

On your local machine:

```bash
cd transpo-system-frontend

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `build` folder with optimized production files.

#### 3. Upload Frontend Files

**Option A: File Manager**
1. Compress the `build` folder contents
2. Upload to Hostinger
3. Extract to `public_html` (or your domain's root)

**Option B: FTP/SFTP**
1. Upload all files from the `build` folder to `public_html`
2. Do NOT upload the `build` folder itself, just its contents

**Option C: SSH**
```bash
# On your server
cd /path/to/frontend
npm install
npm run build

# Move build contents to public_html
cp -r build/* /home/username/public_html/
```

#### 4. Configure URL Rewriting

Create/update `.htaccess` in your frontend root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🔧 Configuration Guide

### Domain Configuration

**Option 1: Subdomain for Backend**
- Frontend: `https://budgetbyahe.com`
- Backend API: `https://api.budgetbyahe.com`

**Option 2: Subfolder for Backend**
- Frontend: `https://budgetbyahe.com`
- Backend API: `https://budgetbyahe.com/api`

### CORS Configuration

Your Laravel backend is already configured to handle CORS dynamically based on the `FRONTEND_URL` environment variable.

### SSL Certificate

1. In Hostinger control panel, go to SSL
2. Install free Let's Encrypt SSL certificate
3. Force HTTPS redirect
4. Update your `.env` files to use `https://`

---

## ✅ Post-Deployment Checklist

### Backend

- [ ] `.env` file configured correctly
- [ ] Database connected successfully
- [ ] Firebase credentials uploaded and working
- [ ] Migrations run successfully
- [ ] Storage directory writable (755 permissions)
- [ ] SSL certificate installed
- [ ] API endpoints responding (test with Postman)
- [ ] CORS headers working correctly

### Frontend

- [ ] Build files uploaded to correct directory
- [ ] `.htaccess` configured for React routing
- [ ] Environment variables set correctly
- [ ] Firebase configuration working
- [ ] API calls connecting to backend
- [ ] SSL certificate installed
- [ ] All pages loading correctly
- [ ] Images and assets loading
- [ ] Admin panel accessible

---

## 🧪 Testing

### Test Backend API

```bash
# Test if backend is responding
curl https://api.your-domain.com/api/test

# Test with browser
https://api.your-domain.com
```

### Test Frontend

1. Open `https://www.your-domain.com`
2. Check browser console for errors
3. Test navigation between pages
4. Test login/signup functionality
5. Test admin panel access
6. Test Firebase authentication
7. Test API calls (check Network tab)

---

## 🐛 Troubleshooting

### Issue: "CORS Error"

**Solution:**
- Verify `FRONTEND_URL` in backend `.env`
- Check `config/cors.php` settings
- Clear Laravel cache: `php artisan config:cache`

### Issue: "404 on React Routes"

**Solution:**
- Ensure `.htaccess` is present in frontend root
- Check if mod_rewrite is enabled
- Verify all routes in `App.js`

### Issue: "API Connection Failed"

**Solution:**
- Check `REACT_APP_API_URL` in frontend `.env.production`
- Verify backend is running
- Check SSL certificates
- Test API endpoint directly in browser

### Issue: "Firebase Not Connecting"

**Solution:**
- Verify Firebase configuration in `firebase.js`
- Check Firebase project settings
- Ensure Firebase service account JSON is uploaded
- Check browser console for specific Firebase errors

### Issue: "Database Connection Error"

**Solution:**
- Verify database credentials in `.env`
- Check if database exists
- Test connection using MySQL client
- Ensure database user has proper permissions

### Issue: "500 Internal Server Error"

**Solution:**
- Check Laravel logs: `storage/logs/laravel.log`
- Enable debug mode temporarily: `APP_DEBUG=true`
- Check file permissions
- Verify PHP version compatibility

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Set `APP_DEBUG=false`** in production
3. **Use strong database passwords**
4. **Keep dependencies updated**
5. **Enable HTTPS/SSL**
6. **Secure Firebase service account file**
7. **Use environment variables** for all secrets
8. **Regular backups** of database and files
9. **Monitor error logs** regularly
10. **Implement rate limiting** on API endpoints

---

## 📊 Monitoring

### Backend Monitoring

- Check Laravel logs daily: `storage/logs/laravel.log`
- Monitor database performance
- Track API response times
- Set up error notifications

### Frontend Monitoring

- Use browser console to check for errors
- Monitor API call failures
- Check Firebase usage and quotas
- Use Google Analytics (optional)

---

## 🔄 Updating Your Application

### Backend Updates

```bash
# On your server
cd /path/to/backend
git pull origin main
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

### Frontend Updates

```bash
# On your local machine
cd transpo-system-frontend
git pull origin main
npm install
npm run build

# Upload new build files to Hostinger
```

---

## 📞 Support Resources

- **Hostinger Support**: https://www.hostinger.com/support
- **Laravel Documentation**: https://laravel.com/docs
- **React Documentation**: https://react.dev
- **Firebase Documentation**: https://firebase.google.com/docs

---

## 🎉 Success!

Once deployed, your application will be accessible at:
- Frontend: `https://www.your-domain.com`
- Backend API: `https://api.your-domain.com`
- Admin Panel: `https://www.your-domain.com/admin/login`

**Remember to:**
- Test all functionality thoroughly
- Monitor logs for errors
- Keep backups of your database
- Update your documentation with actual URLs

---

**Last Updated**: October 30, 2025  
**Maintained by**: ByaHERO Team
