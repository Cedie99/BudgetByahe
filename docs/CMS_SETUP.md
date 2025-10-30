# CMS Setup Instructions

## Initial Setup

To initialize the CMS system for the first time, follow these steps:

### 1. Firebase Firestore Setup

Make sure your Firebase Firestore has the following structure:

```
settings (collection)
  └── cms (document)
```

### 2. Initialize Default CMS Data

You can initialize the default CMS data in two ways:

#### Option A: Through Admin Panel (Recommended)

1. Login to the admin panel: `http://localhost:3000/admin/login`
2. Navigate to "Content Management"
3. The default values will load automatically
4. Click "Save Changes" to store them in Firebase

#### Option B: Manual Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **budget-byahe-ddfe5**
3. Go to Firestore Database
4. Create a collection named `settings`
5. Create a document with ID `cms`
6. Add the following fields:

```javascript
{
  navbarBrand: "Budget Byahe",
  navbarLogo: "",
  
  heroTitle: "Smart Fare Calculation for Tricycles & Jeepneys",
  heroSubtitle: "Empowering commuters with accurate, fair, and easy-to-understand fare calculations for every ride.",
  heroButtonText: "Find My Route",
  
  feature1Title: "Smart Fare Calculator",
  feature1Description: "Instantly calculate transportation costs for jeepneys, tricycles, buses, and more",
  feature2Title: "Route Discovery",
  feature2Description: "Find the best routes and compare fares across different transportation modes",
  feature3Title: "Real-time Updates",
  feature3Description: "Stay informed with the latest fare rates and route information",
  
  aboutTitle: "About Budget Byahe",
  aboutDescription: "Your trusted companion for budget-friendly transportation planning in the Philippines",
  
  footerText: "Your smart travel companion for everyday commuting.",
  contactEmail: "support@budgetbyahe.com",
  contactPhone: "+63 123 456 7890",
  
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  
  primaryColor: "#0a5c36",
  secondaryColor: "#0d7a49",
  accentColor: "#fbbf24"
}
```

### 3. Firebase Security Rules

Update your Firestore security rules to allow admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // CMS settings - read by all, write by admin only
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Other collections...
  }
}
```

### 4. Test the CMS

1. **Client Side**: Visit `http://localhost:3000/home` and verify default content displays
2. **Admin Panel**: Login and navigate to Content Management
3. **Make Changes**: Update any field and click "Save Changes"
4. **Verify**: Check that changes appear immediately on the client side

### 5. Troubleshooting

If content doesn't load:

1. **Check Browser Console**: Look for errors
2. **Verify Firebase Connection**: Ensure Firebase config is correct
3. **Check Firestore Rules**: Make sure read access is allowed
4. **Check Network Tab**: Verify Firebase requests are successful

If changes don't save:

1. **Check Admin Auth**: Ensure you're logged in as admin
2. **Check Firebase Rules**: Verify admin has write access
3. **Check Console Errors**: Look for permission denied errors
4. **Verify Admin Role**: Check user document has `role: "admin"`

## Testing Checklist

- [ ] Default CMS data loads on first visit
- [ ] Admin can access CMS panel
- [ ] Text content updates reflect immediately
- [ ] Image uploads work correctly
- [ ] Color changes apply to the site
- [ ] Preview button opens site in new tab
- [ ] Save button stores changes to Firebase
- [ ] Reset button reverts unsaved changes
- [ ] Changes persist across browser refresh
- [ ] Multiple admins can edit simultaneously
- [ ] Client sees updates in real-time

## Next Steps

After successful setup:

1. Customize all content through the admin panel
2. Upload your logo
3. Set your brand colors
4. Update contact information
5. Add social media links
6. Test on mobile devices
7. Share preview with stakeholders

---

**Note**: This CMS is connected to Firebase Firestore and updates in real-time. Any changes made by admins will immediately reflect on the live website for all users.
