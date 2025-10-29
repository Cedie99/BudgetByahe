# Content Management System (CMS) Guide

## Overview

The Budget Byahe CMS allows administrators to customize the appearance and content of the client-side web application in real-time without touching the code. All changes are stored in Firebase Firestore and immediately reflected across the website.

## Features

### 🎨 What You Can Customize

#### 1. **Navigation Bar**
- Brand Name
- Logo Image

#### 2. **Hero Section**
- Main Title
- Subtitle/Description
- Call-to-Action Button Text

#### 3. **Features Section**
- Feature 1 Title & Description
- Feature 2 Title & Description
- Feature 3 Title & Description

#### 4. **Contact Information**
- Email Address
- Phone Number
- Footer Text

#### 5. **Social Media Links**
- Facebook URL
- Twitter URL
- Instagram URL

#### 6. **Theme Colors**
- Primary Color (Main brand color)
- Secondary Color (Complementary color)
- Accent Color (Highlights and CTAs)

## How to Use

### Accessing the CMS

1. Navigate to: `http://localhost:3000/admin/login`
2. Login with your admin credentials
3. Click on **"Content Management"** in the sidebar

### Making Changes

#### Text Content

1. Click on any text field you want to modify
2. Type your new content
3. The changes are stored locally until you click "Save Changes"

#### Uploading Images

1. Click the **"Upload Logo"** button under the Logo section
2. Select an image from your computer
3. The image will be previewed immediately
4. Click "Save Changes" to apply

#### Changing Colors

1. Click on the color picker for Primary, Secondary, or Accent colors
2. Select your desired color
3. Alternatively, enter a hex color code (e.g., `#0a5c36`)
4. Click "Save Changes" to apply the new theme

### Preview Changes

Before saving, you can preview your changes:

1. Click the **"Preview Site"** button in the top right
2. A new tab will open showing the client-side with your current CMS settings
3. Review the changes
4. Return to the CMS to make adjustments or save

### Saving Changes

1. After making all desired changes, click **"Save Changes"**
2. A success notification will appear
3. Changes are immediately applied to the live website
4. All users will see the updated content

### Resetting Changes

If you want to discard unsaved changes:

1. Click **"Reset Changes"**
2. Confirm the action
3. All fields will revert to the last saved state

## Technical Implementation

### Architecture

```
┌─────────────────────────────────────────────┐
│          Admin CMS Panel                    │
│  (AdminCMS.js - Edit & Save)                │
└──────────────┬──────────────────────────────┘
               │
               │ setDoc()
               ▼
┌─────────────────────────────────────────────┐
│     Firebase Firestore                       │
│  Collection: settings                        │
│  Document: cms                               │
└──────────────┬──────────────────────────────┘
               │
               │ onSnapshot() - Real-time
               ▼
┌─────────────────────────────────────────────┐
│      Custom Hook (useCMS.js)                │
│  - Subscribes to CMS data                   │
│  - Updates CSS variables                    │
└──────────────┬──────────────────────────────┘
               │
               │ cmsData
               ▼
┌─────────────────────────────────────────────┐
│   Client Components                         │
│  - Home.js                                  │
│  - Navbar.js                                │
│  - Footer.js                                │
└─────────────────────────────────────────────┘
```

### Files Modified

1. **Created:**
   - `src/hooks/useCMS.js` - Custom React hook for CMS data

2. **Updated:**
   - `src/admin/AdminCMS.js` - Admin panel for editing
   - `src/admin/AdminCMS.css` - Styling for CMS admin
   - `src/Home.js` - Uses CMS data for hero & features
   - `src/Navbar.js` - Uses CMS data for branding
   - `src/Footer.js` - Uses CMS data for contact & social
   - `src/index.css` - CSS variables for theme colors

### Firebase Structure

```javascript
{
  "settings": {
    "cms": {
      // Navbar
      "navbarBrand": "Budget Byahe",
      "navbarLogo": "data:image/png;base64,...",
      
      // Hero
      "heroTitle": "Smart Fare Calculation...",
      "heroSubtitle": "Empowering commuters...",
      "heroButtonText": "Find My Route",
      
      // Features
      "feature1Title": "Smart Fare Calculator",
      "feature1Description": "Instantly calculate...",
      // ... more features
      
      // Contact
      "contactEmail": "support@budgetbyahe.com",
      "contactPhone": "+63 123 456 7890",
      "footerText": "Your smart travel...",
      
      // Social Media
      "facebookUrl": "https://facebook.com/...",
      "twitterUrl": "https://twitter.com/...",
      "instagramUrl": "https://instagram.com/...",
      
      // Theme Colors
      "primaryColor": "#0a5c36",
      "secondaryColor": "#0d7a49",
      "accentColor": "#fbbf24",
      
      // Metadata
      "updatedAt": "2025-10-26T..."
    }
  }
}
```

### CSS Variables

Theme colors are applied as CSS variables:

```css
:root {
  --cms-primary-color: #0a5c36;
  --cms-secondary-color: #0d7a49;
  --cms-accent-color: #fbbf24;
}
```

To use these colors in your components:

```css
.my-element {
  background-color: var(--cms-primary-color);
  color: var(--cms-accent-color);
}
```

## Best Practices

### Content Guidelines

1. **Hero Title**: Keep it under 100 characters for best display
2. **Hero Subtitle**: 150-200 characters works best
3. **Feature Titles**: 3-5 words maximum
4. **Feature Descriptions**: 1-2 sentences

### Image Guidelines

1. **Logo Format**: PNG with transparent background recommended
2. **Logo Size**: 200x80 pixels (or similar aspect ratio)
3. **File Size**: Keep under 500KB for fast loading

### Color Guidelines

1. **Primary Color**: Should have good contrast with white text
2. **Secondary Color**: Should complement the primary color
3. **Accent Color**: Use for calls-to-action and highlights
4. **Accessibility**: Ensure color contrast meets WCAG standards

## Troubleshooting

### Changes Not Appearing?

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
2. **Check Firebase**: Verify data is saved in Firestore
3. **Check console**: Look for any JavaScript errors
4. **Verify auth**: Ensure you're logged in as admin

### Images Not Uploading?

1. **File size**: Ensure image is under 2MB
2. **Format**: Use JPG, PNG, or WebP
3. **Browser support**: Try a different browser
4. **Firebase quota**: Check Firebase storage limits

### Colors Not Updating?

1. **Format**: Use valid hex codes (e.g., #0a5c36)
2. **Save changes**: Make sure you clicked "Save Changes"
3. **CSS cache**: Clear browser cache
4. **CSS variables**: Check if component uses CSS variables

## Future Enhancements

Potential features to add:

- [ ] Image library/media manager
- [ ] Multi-language support
- [ ] Page layout customization
- [ ] Custom CSS injection
- [ ] Content versioning/history
- [ ] Scheduled content publishing
- [ ] A/B testing for content
- [ ] SEO meta tags editing
- [ ] Google Analytics integration
- [ ] Email template customization

## Security Considerations

- ✅ Admin authentication required
- ✅ Role-based access control
- ✅ Input validation on save
- ✅ Firebase security rules applied
- ⚠️ Image uploads stored as base64 (consider Firebase Storage for production)
- ⚠️ No content moderation (manual review needed)

## Support

For issues or questions about the CMS:

1. Check this documentation first
2. Review the browser console for errors
3. Check Firebase Firestore rules
4. Contact the development team

---

**Last Updated**: October 26, 2025  
**Version**: 1.0.0  
**Maintained by**: ByaHERO Team
