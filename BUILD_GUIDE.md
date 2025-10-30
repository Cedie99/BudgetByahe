# React Build Configuration

## Building for Production

This document explains how to build your React frontend for different environments.

## Development Build

For local development:

```bash
npm start
```

This will use `.env` file variables.

## Production Build

### Method 1: Using .env.production

1. Create or edit `.env.production`:
```env
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_URL=https://www.your-domain.com
REACT_APP_MAPBOX_TOKEN=your_token
REACT_APP_GROQ_API_KEY=your_key
NODE_ENV=production
```

2. Build:
```bash
npm run build
```

### Method 2: Inline Environment Variables

Build with specific environment variables:

```bash
# Windows (PowerShell)
$env:REACT_APP_API_URL="https://api.your-domain.com"; npm run build

# Windows (CMD)
set REACT_APP_API_URL=https://api.your-domain.com && npm run build

# Linux/Mac
REACT_APP_API_URL=https://api.your-domain.com npm run build
```

### Method 3: Using Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:prod": "env-cmd -f .env.production react-scripts build",
    "build:staging": "env-cmd -f .env.staging react-scripts build"
  }
}
```

Install env-cmd:
```bash
npm install --save-dev env-cmd
```

## Build Output

The build command creates a `build/` folder containing:

```
build/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── index.html
├── manifest.json
└── robots.txt
```

## Upload to Hostinger

### Option 1: Manual Upload

1. Build your application:
```bash
npm run build
```

2. Upload contents of `build/` folder to Hostinger's `public_html/` directory

### Option 2: FTP Deployment

Using FileZilla or similar:
1. Connect to your Hostinger account
2. Navigate to `public_html/`
3. Upload all files from `build/` folder
4. Ensure `.htaccess` is present for React routing

### Option 3: Git Deployment (If supported)

```bash
# After building
git add build/
git commit -m "Production build"
git push hostinger main
```

## Environment Variables in Production

Your app will use these variables at runtime:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_URL` - Frontend URL
- `REACT_APP_MAPBOX_TOKEN` - Mapbox API token
- `REACT_APP_GROQ_API_KEY` - Groq AI API key

**Important**: Environment variables are embedded at build time and cannot be changed without rebuilding!

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

- Ensure variables start with `REACT_APP_`
- Check if `.env.production` exists
- Verify build command is using correct env file
- Remember to rebuild after changing env variables

### Large Build Size

To analyze bundle size:

```bash
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

## Performance Optimization

Add to `.env.production`:

```env
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
IMAGE_INLINE_SIZE_LIMIT=10000
```

## Security Notes

- Never commit `.env.production` with secrets
- Use environment variables for all sensitive data
- Minimize exposed API keys
- Use HTTPS in production

## Quick Deploy Checklist

- [ ] Update `.env.production` with production URLs
- [ ] Run `npm run build`
- [ ] Test build locally: `npx serve -s build`
- [ ] Upload `build/` contents to Hostinger
- [ ] Verify `.htaccess` for React routing
- [ ] Test all pages and functionality
- [ ] Check browser console for errors
- [ ] Verify API connections work
