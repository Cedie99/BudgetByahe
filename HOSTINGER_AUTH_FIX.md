# 🔧 Fixing Google & Facebook Authentication on Hostinger

## 🎯 Problem Analysis

Based on your Hostinger file structure, here are the issues preventing Google/Facebook login from working:

### Current Setup:
- ✅ Subdomain: `api.budgetbyahe.com` → Points to `/domains/budgetbyahe.com/public_html/api`
- ✅ Main domain: `budgetbyahe.com` → Points to `/domains/budgetbyahe.com/public_html`
- ❌ Backend document root is pointing to the wrong folder
- ❌ Firebase authorized domains not configured
- ❌ OAuth redirect URIs not updated

---

## 🚨 Critical Issues to Fix

### Issue 1: Backend Document Root
**Current**: `/domains/budgetbyahe.com/public_html/api/`
**Should be**: `/domains/budgetbyahe.com/public_html/api/public/`

Your Laravel backend's entry point is `public/index.php`, not the root folder!

### Issue 2: Firebase Configuration
Google and Facebook authentication requires authorized domains to be added in Firebase Console.

### Issue 3: OAuth Callback URLs
Google and Facebook need your production URLs registered in their developer consoles.

---

## ✅ Step-by-Step Fix

### Step 1: Fix Backend Subdomain Document Root

1. **Go to Hostinger Panel** → Domains → Subdomains
2. **Find** `api.budgetbyahe.com`
3. **Edit Document Root** to:
   ```
   /domains/budgetbyahe.com/public_html/api/public
   ```
   (Add `/public` at the end!)

4. **Save** and wait 2-5 minutes for propagation

**Alternative via File Manager:**
If you can't change document root, move files:
```
# Move everything from api/ to api/temp/
# Then move everything from api/temp/public/* to api/
# This makes public/ the root folder
```

---

### Step 2: Configure Firebase Authorized Domains

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select** your project: `budget-byahe-ddfe5`
3. **Navigate to**: Authentication → Settings → Authorized domains
4. **Add these domains**:
   - `budgetbyahe.com`
   - `www.budgetbyahe.com`
   - `api.budgetbyahe.com`

**Without this, Firebase authentication will be blocked!**

---

### Step 3: Configure Google OAuth

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Find** your OAuth 2.0 Client ID
4. **Add Authorized JavaScript origins**:
   ```
   https://budgetbyahe.com
   https://www.budgetbyahe.com
   ```

5. **Add Authorized redirect URIs**:
   ```
   https://budgetbyahe.com/__/auth/handler
   https://www.budgetbyahe.com/__/auth/handler
   https://budget-byahe-ddfe5.firebaseapp.com/__/auth/handler
   ```

6. **Save**

---

### Step 4: Configure Facebook OAuth

1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Select** your app
3. **Navigate to**: Settings → Basic
4. **Add App Domains**:
   ```
   budgetbyahe.com
   ```

5. **Navigate to**: Facebook Login → Settings
6. **Add Valid OAuth Redirect URIs**:
   ```
   https://budgetbyahe.com/__/auth/handler
   https://www.budgetbyahe.com/__/auth/handler
   https://budget-byahe-ddfe5.firebaseapp.com/__/auth/handler
   ```

7. **Save**

---

### Step 5: Update Your .env on Hostinger

**On your backend** (`api.budgetbyahe.com`), ensure `.env` has:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.budgetbyahe.com

FRONTEND_URL=https://budgetbyahe.com

SESSION_DOMAIN=.budgetbyahe.com
SANCTUM_STATEFUL_DOMAINS=budgetbyahe.com,www.budgetbyahe.com
```

**Clear Laravel cache after updating:**
```bash
php artisan config:cache
php artisan route:cache
php artisan cache:clear
```

---

### Step 6: Verify .htaccess Files

**Frontend (.htaccess in public_html/):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # React Router
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

**Backend (.htaccess in api/public/):**
Should already be there from Laravel, but verify it exists.

---

### Step 7: Test Authentication

1. **Clear browser cache** and cookies
2. **Visit**: https://budgetbyahe.com
3. **Try Google Login**:
   - Click "Sign in with Google"
   - Should redirect to Google
   - After auth, should return to your site

4. **Try Facebook Login**:
   - Click "Sign in with Facebook"
   - Should redirect to Facebook
   - After auth, should return to your site

---

## 🧪 Debugging Steps

### Check if Backend is Accessible

Open browser and visit:
```
https://api.budgetbyahe.com
```

**Expected**: Laravel welcome page or JSON response
**If you see**: Directory listing or 404 → Document root is wrong!

### Check Firebase Authentication

Open browser console (F12) and look for errors like:
- `auth/unauthorized-domain` → Fix Step 2 (Firebase Authorized Domains)
- `auth/redirect-uri-mismatch` → Fix Step 3 & 4 (OAuth URIs)
- `CORS error` → Fix backend .env CORS settings

### Check Network Requests

1. Open browser console → Network tab
2. Try to login with Google/Facebook
3. Look for failed requests
4. Check response messages

---

## 📋 Hostinger File Structure (Should Be)

```
/domains/budgetbyahe.com/
├── public_html/                    ← Frontend (budgetbyahe.com)
│   ├── static/                     ← React build files
│   ├── index.html
│   ├── .htaccess                   ← React routing
│   └── ...other React files
│
└── public_html/api/                ← Backend files
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/                     ← THIS should be document root!
    │   ├── index.php               ← Laravel entry point
    │   └── .htaccess
    ├── routes/
    ├── storage/
    │   └── firebase-service-account.json
    ├── .env                        ← Production settings
    ├── composer.json
    └── ...other Laravel files
```

**Subdomain Configuration:**
- `api.budgetbyahe.com` → Document Root: `/domains/budgetbyahe.com/public_html/api/public`

---

## 🔐 Security Checklist

After fixing authentication:

- [ ] SSL certificates installed for both domains
- [ ] Force HTTPS enabled
- [ ] `APP_DEBUG=false` in production .env
- [ ] Firebase service account file has secure permissions (600)
- [ ] Database credentials are strong
- [ ] CORS configured to allow only your frontend domain
- [ ] OAuth credentials not exposed in frontend code

---

## 🆘 Still Not Working?

### Error: "This app is not available in your country"
**Solution**: In Facebook Developer Console, set app to "Live" mode (not Development)

### Error: "redirect_uri_mismatch"
**Solution**: Double-check ALL redirect URIs in Google/Facebook console match exactly (include https://)

### Error: "Access Blocked: This app's request is invalid"
**Solution**: 
1. Go to Google Cloud Console
2. OAuth Consent Screen → Make app "Internal" or add test users
3. Or publish app for public use

### Error: "auth/unauthorized-domain"
**Solution**: Add domain to Firebase Console → Authentication → Settings → Authorized domains

---

## 📞 Quick Commands for Hostinger Terminal

```bash
# Navigate to backend
cd /home/u356758842/domains/budgetbyahe.com/public_html/api

# Check current directory
pwd

# Clear all Laravel caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Recache for production
php artisan config:cache
php artisan route:cache

# Check permissions
ls -la storage
ls -la bootstrap/cache

# Fix permissions if needed
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

---

## ✅ Verification Checklist

- [ ] Backend subdomain document root points to `/public` folder
- [ ] Firebase authorized domains added (budgetbyahe.com, api.budgetbyahe.com)
- [ ] Google OAuth redirect URIs configured
- [ ] Facebook OAuth redirect URIs configured
- [ ] Production .env configured correctly
- [ ] Laravel cache cleared and recached
- [ ] SSL certificates active on both domains
- [ ] Can access api.budgetbyahe.com successfully
- [ ] Frontend loads without errors
- [ ] Email/password login works
- [ ] Google login works
- [ ] Facebook login works

---

## 📌 Important Notes

1. **Cache Propagation**: After changing DNS/subdomain settings, wait 5-10 minutes
2. **Browser Cache**: Always test in incognito/private mode after changes
3. **Firebase Quotas**: Check Firebase Console for usage limits
4. **OAuth Limits**: Google/Facebook have rate limits for authentication

---

**Last Updated**: October 30, 2025  
**For**: Budget Byahe Production Deployment  
**Status**: Critical Authentication Fix Required
