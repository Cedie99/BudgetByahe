# Budget Byahe - Admin Account Setup Guide

## 🔐 How to Create an Admin Account

There are **3 methods** to create an admin account for your Budget Byahe application:

---

## Method 1: Using Firebase Console (Recommended)

This is the easiest and most secure method.

### Steps:

1. **Create a Regular User Account**
   - Go to your Budget Byahe website: `http://localhost:3000/signup`
   - Sign up with email and password (or use Google/Facebook login)
   - Complete the registration process

2. **Access Firebase Console**
   - Go to: [Firebase Console](https://console.firebase.google.com/)
   - Select your project: **budget-byahe-ddfe5**
   - Click on **Firestore Database** in the left sidebar

3. **Add Admin Role to User**
   - Navigate to the `users` collection
   - Find the user document using their email or UID
   - Click on the document to open it
   - Click **Add field** button
   - Enter:
     - **Field name:** `role`
     - **Type:** `string`
     - **Value:** `admin`
   - Click **Save**

4. **Test Admin Access**
   - Go to: `http://localhost:3000/admin/login`
   - Login with the user's email and password
   - You should be redirected to the admin dashboard!

---

## Method 2: Manual Firestore Document Creation

If you want to create an admin user directly without signing up first.

### Steps:

1. **Create Firebase Auth User**
   - Go to Firebase Console → Authentication
   - Click **Add user**
   - Enter email and password
   - Click **Add user**
   - Copy the **User UID** (you'll need this)

2. **Create Firestore Document**
   - Go to Firebase Console → Firestore Database
   - Click on `users` collection (create it if it doesn't exist)
   - Click **Add document**
   - **Document ID:** Paste the User UID from step 1
   - Add the following fields:

   | Field | Type | Value |
   |-------|------|-------|
   | email | string | admin@budgetbyahe.com |
   | firstName | string | Admin |
   | lastName | string | User |
   | role | string | admin |
   | createdAt | timestamp | (current time) |

   - Click **Save**

3. **Login to Admin Panel**
   - Go to: `http://localhost:3000/admin/login`
   - Use the email and password you set in step 1

---

## Method 3: Programmatically (For Developers)

Create a one-time script to set up admin users.

### Create: `src/utils/createAdmin.js`

```javascript
import { auth, createUserWithEmailAndPassword, db, doc, setDoc } from '../firebase';

async function createAdminUser() {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@budgetbyahe.com', // Change this email
      'AdminPassword123!' // Change this password
    );
    
    const user = userCredential.user;
    
    // Create Firestore document with admin role
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', user.email);
    console.log('UID:', user.uid);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

// Call the function
createAdminUser();
```

### Run the script:

```bash
# In your terminal
node src/utils/createAdmin.js
```

**⚠️ Important:** Delete this file after creating your admin account for security!

---

## 🎯 Admin Panel Access

Once you have an admin account:

1. **Admin Login Page:** `http://localhost:3000/admin/login`
2. **Admin Dashboard:** `http://localhost:3000/admin/dashboard`

### Admin Panel Features:

- 📊 **Dashboard** - View statistics and recent activity
- 🗺️ **Routes Management** - Add, edit, delete transportation routes
- 📝 **Content Management** - Edit website content, colors, and branding
- 💬 **User Feedback** - Monitor and respond to user feedback

---

## 🔒 Security Best Practices

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, and symbols
   - Example: `Admin@BudgetByahe2024!`

2. **Limit Admin Accounts**
   - Only create admin accounts for trusted team members
   - Remove admin role when staff leaves

3. **Regular Security Audits**
   - Review admin user list monthly
   - Check Firebase Security Rules
   - Monitor Firebase Authentication logs

4. **Enable Two-Factor Authentication** (Optional)
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Email/Password MFA (Multi-Factor Authentication)

---

## 🆘 Troubleshooting

### "Access denied. Admin privileges required."

**Problem:** User doesn't have admin role in Firestore.

**Solution:**
- Go to Firestore Database → `users` collection
- Find the user document
- Verify the `role` field is set to `"admin"` (lowercase, no extra spaces)

### "Invalid email or password."

**Problem:** Wrong credentials or user doesn't exist.

**Solution:**
- Verify the email and password in Firebase Authentication
- Try resetting the password using "Forgot Password" (if implemented)
- Check if the user exists in Firebase Console → Authentication

### Can't access admin routes after login

**Problem:** localStorage not set correctly.

**Solution:**
- Clear browser cache and localStorage
- Re-login to the admin panel
- Check browser console for errors (F12)

---

## 📞 Support

If you encounter any issues:

1. Check the browser console (F12) for error messages
2. Verify Firebase configuration in `src/firebase.js`
3. Ensure Firestore Security Rules allow admin access
4. Contact your development team for assistance

---

## 🎨 Branding

The admin panel uses a **blue color scheme** to distinguish it from the client-side (green theme):

- **Client Side:** Green gradient (#0a5c36 → #0d7a49)
- **Admin Panel:** Blue gradient (#1e3a8a → #3b82f6)

This color differentiation helps prevent confusion between the admin panel and regular user interface.

---

**Last Updated:** October 25, 2025
**Version:** 1.0.0
