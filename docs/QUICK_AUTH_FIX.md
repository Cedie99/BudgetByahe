# 🎯 Quick Fix Checklist for Google/Facebook Login

## ⚠️ CRITICAL: Fix Backend Document Root FIRST!

### Current Problem:
```
api.budgetbyahe.com → /public_html/api/  ❌ WRONG!
```

### Correct Setup:
```
api.budgetbyahe.com → /public_html/api/public/  ✅ CORRECT!
```

---

## 🔧 3 Main Issues to Fix

### 1️⃣ Backend Subdomain Configuration (CRITICAL!)

**In Hostinger Panel:**
1. Go to: **Websites** → **budgetbyahe.com** → **Subdomains**
2. Click on **api.budgetbyahe.com**
3. Change Document Root from:
   ```
   /domains/budgetbyahe.com/public_html/api
   ```
   To:
   ```
   /domains/budgetbyahe.com/public_html/api/public
   ```
4. **Save**
5. Wait 2-5 minutes

**Why?** Laravel's entry point is `public/index.php`, not the root folder!

---

### 2️⃣ Firebase Authorized Domains

**Go to Firebase Console:**
1. Visit: https://console.firebase.google.com/
2. Select project: **budget-byahe-ddfe5**
3. Go to: **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain** and add:
   - `budgetbyahe.com`
   - `www.budgetbyahe.com`
   - `api.budgetbyahe.com`

**Screenshot location:** Authentication tab → Settings gear icon → Authorized domains section

---

### 3️⃣ Google OAuth Configuration

**Go to Google Cloud Console:**
1. Visit: https://console.cloud.google.com/
2. Go to: **APIs & Services** → **Credentials**
3. Click your **OAuth 2.0 Client ID**
4. In **Authorized JavaScript origins**, add:
   ```
   https://budgetbyahe.com
   https://www.budgetbyahe.com
   ```
5. In **Authorized redirect URIs**, add:
   ```
   https://budgetbyahe.com/__/auth/handler
   https://www.budgetbyahe.com/__/auth/handler
   https://budget-byahe-ddfe5.firebaseapp.com/__/auth/handler
   ```
6. **Save**

---

### 4️⃣ Facebook OAuth Configuration (If using Facebook Login)

**Go to Facebook Developers:**
1. Visit: https://developers.facebook.com/apps/
2. Select your app
3. Go to: **Settings** → **Basic**
4. Add **App Domains**: `budgetbyahe.com`
5. Go to: **Facebook Login** → **Settings**
6. In **Valid OAuth Redirect URIs**, add:
   ```
   https://budgetbyahe.com/__/auth/handler
   https://www.budgetbyahe.com/__/auth/handler
   https://budget-byahe-ddfe5.firebaseapp.com/__/auth/handler
   ```
7. **Save**

---

## 🧪 Test After Each Fix

### Test 1: Backend Accessibility
Visit: https://api.budgetbyahe.com

**Expected:** Laravel page or API response  
**Wrong:** 404 error or directory listing → Document root not fixed!

### Test 2: Google Login
1. Open: https://budgetbyahe.com
2. Click **Sign in with Google**
3. Select Google account

**Expected:** Redirects back to your site, logged in  
**Error "unauthorized-domain":** Fix Firebase authorized domains  
**Error "redirect_uri_mismatch":** Fix Google OAuth redirect URIs

### Test 3: Facebook Login
1. Click **Sign in with Facebook**
2. Authorize app

**Expected:** Redirects back to your site, logged in  
**Errors:** Check Facebook OAuth configuration

---

## 📱 Quick Terminal Commands (Via Hostinger SSH)

```bash
# Navigate to backend
cd /home/u356758842/domains/budgetbyahe.com/public_html/api

# Clear caches
php artisan config:clear
php artisan cache:clear

# Recache for production
php artisan config:cache

# Test if backend is accessible
curl https://api.budgetbyahe.com
```

---

## 🚨 Common Errors & Solutions

| Error | Solution |
|-------|----------|
| `auth/unauthorized-domain` | Add domain to Firebase authorized domains |
| `redirect_uri_mismatch` | Update Google/Facebook OAuth redirect URIs |
| `Cannot GET /api` | Backend document root pointing to wrong folder |
| `CORS error` | Check backend .env FRONTEND_URL setting |
| `500 Internal Server Error` | Check storage/ folder permissions (755) |

---

## ✅ Verification Steps

1. [ ] Can access https://api.budgetbyahe.com (shows Laravel page)
2. [ ] Can access https://budgetbyahe.com (shows your app)
3. [ ] Email/password login works
4. [ ] Google login works without errors
5. [ ] Facebook login works without errors
6. [ ] No CORS errors in browser console
7. [ ] User data saves to Firebase correctly

---

## 📞 Need Help?

Check detailed guide: **HOSTINGER_AUTH_FIX.md**

**Common mistake:** Forgetting to add `/public` to backend document root!

---

**Priority Order:**
1. Fix backend document root (Most Critical!)
2. Add Firebase authorized domains
3. Configure Google OAuth
4. Configure Facebook OAuth
5. Clear Laravel cache
6. Test everything

**Estimated Time:** 15-20 minutes
