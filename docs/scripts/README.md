# 🛠️ Budget Byahe - Utility Scripts

This folder contains utility scripts for database setup, testing, and maintenance.

---

## 📁 Available Scripts

### 1. setup-database.bat
**Platform:** Windows  
**Purpose:** Automated database setup for local development

**Usage:**
```powershell
cd c:\xampp\htdocs\BudgetByahe\docs\scripts
.\setup-database.bat
```

**What it does:**
- Guides you through database creation
- Checks database connection
- Runs Laravel migrations
- Seeds sample data (optional)
- Verifies installation

**Prerequisites:**
- XAMPP running with MySQL
- Laravel backend configured
- Composer installed

---

### 2. clear-cache.sh
**Platform:** Linux/Unix (Hostinger, VPS)  
**Purpose:** Clear all Laravel caches on production server

**Usage:**
```bash
cd /path/to/your/laravel/app
bash clear-cache.sh
```

**What it does:**
- Clears config cache
- Clears application cache
- Clears route cache
- Clears view cache

**Use cases:**
- After updating `.env` file
- After deploying new code
- When configuration changes aren't applying
- Troubleshooting cache-related issues

**Alternative (direct commands):**
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

### 3. test-db.php
**Platform:** Any (Web-accessible)  
**Purpose:** Test database connection on production servers (especially Hostinger)

**Usage:**
1. Upload to your public web directory
2. Access via browser: `https://api.budgetbyahe.com/test-db.php`
3. Review connection test results
4. **DELETE FILE AFTER TESTING** (security risk)

**What it does:**
- Tests database connection with different hosts (127.0.0.1, localhost)
- Verifies credentials
- Shows PHP MySQL extensions
- Tests query execution
- Displays server information

**Security Warning:**
⚠️ **IMPORTANT**: This file contains database credentials. Always delete it after testing!

---

## 🚀 Quick Reference

### Local Development Setup
```powershell
# 1. Start XAMPP
# 2. Run database setup
cd c:\xampp\htdocs\BudgetByahe\docs\scripts
.\setup-database.bat

# 3. Start backend
cd ..\..\transpo-system-backend
php artisan serve

# 4. Start frontend
cd ..\transpo-system-frontend
npm start
```

### Production Cache Clear
```bash
# SSH into server
ssh user@yourdomain.com

# Navigate to Laravel app
cd /home/u356758842/domains/api.budgetbyahe.com/public_html

# Clear caches
bash clear-cache.sh

# Or run commands directly
php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear
```

### Database Connection Test
```bash
# Upload test-db.php to public directory
# Access via browser
https://api.budgetbyahe.com/test-db.php

# Review results
# DELETE FILE when done
rm test-db.php
```

---

## 🔧 Troubleshooting

### setup-database.bat Issues

**Issue:** "Command not found"
- **Solution:** Run from PowerShell or CMD, not Git Bash

**Issue:** "Database connection failed"
- **Solution:** Verify MySQL is running in XAMPP
- **Solution:** Check `.env` database credentials

**Issue:** "Migrations failed"
- **Solution:** Ensure database exists first
- **Solution:** Run `php artisan migrate:fresh` to reset

### clear-cache.sh Issues

**Issue:** "Permission denied"
- **Solution:** Make script executable: `chmod +x clear-cache.sh`

**Issue:** "Command not found: php"
- **Solution:** Use full path: `/usr/bin/php artisan config:clear`

**Issue:** "Laravel not found"
- **Solution:** Verify you're in the correct directory

### test-db.php Issues

**Issue:** "Page not found"
- **Solution:** Ensure file is in public web directory
- **Solution:** Check file permissions: `chmod 644 test-db.php`

**Issue:** "All connections failed"
- **Solution:** Verify database credentials in the file
- **Solution:** Check database host (try both 127.0.0.1 and localhost)
- **Solution:** Enable Remote MySQL in hosting panel if needed

---

## 📚 Related Documentation

- **[DATABASE_SETUP_GUIDE.md](../DATABASE_SETUP_GUIDE.md)** - Complete database setup
- **[DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** - Production deployment
- **[HOSTINGER_AUTH_FIX.md](../HOSTINGER_AUTH_FIX.md)** - Hostinger-specific fixes
- **[README.md](../../README.md)** - Main project documentation

---

## 🔒 Security Notes

### Important Security Practices

1. **Never commit** database credentials to Git
2. **Always delete** `test-db.php` after use
3. **Restrict permissions** on scripts:
   ```bash
   chmod 750 setup-database.bat
   chmod 750 clear-cache.sh
   ```
4. **Use environment variables** instead of hardcoded credentials
5. **Review scripts** before running on production

---

## 💡 Tips

### Creating Custom Scripts

You can create your own utility scripts following these patterns:

**PowerShell Script Example:**
```powershell
# my-script.ps1
Write-Host "Running custom task..."
cd c:\path\to\project
php artisan custom:command
Write-Host "Done!"
```

**Bash Script Example:**
```bash
#!/bin/bash
# my-script.sh
echo "Running custom task..."
cd /path/to/project
php artisan custom:command
echo "Done!"
```

### Best Practices

- ✅ Add clear comments explaining what script does
- ✅ Include error handling
- ✅ Show progress messages
- ✅ Add prerequisites section
- ✅ Test on clean environment first
- ✅ Document any required environment variables

---

<div align="center">

**Scripts Ready! 🛠️**

*Use these utilities to streamline your development and deployment workflow.*

</div>
