# Setup Instructions

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open browser to http://localhost:5173
```

## Icon Generation

The app needs a 512x512 PNG icon. You have two options:

### Option 1: Use the SVG placeholder (Quick)
The project includes `public/icon.svg`. Copy it as `icon-512.png`:

```bash
# If you have ImageMagick installed:
convert public/icon.svg -resize 512x512 public/icon-512.png

# Or use an online converter:
# 1. Open public/icon.svg in browser
# 2. Take screenshot or use developer tools to save as PNG
# 3. Resize to 512x512
# 4. Save as public/icon-512.png
```

### Option 2: Create custom icon
Replace `public/icon-512.png` with your own 512x512 PNG icon.

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy the dist/ folder
```

## Deployment Options

### 1. Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### 2. Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 3. GitHub Pages
```bash
# Build
npm run build

# Push dist/ folder to gh-pages branch
```

### 4. Local Server (Offline Use)
```bash
# Build
npm run build

# Serve locally
cd dist
npx serve -s -p 3000

# Access from network devices at http://[your-ip]:3000
```

## Testing Offline Mode

1. Visit app while online
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Refresh page - app should still work
5. Create handovers and export PDFs

## Browser Compatibility

- Chrome 90+: Full support ✅
- Safari 14+: Full support ✅
- Firefox 88+: Full support ✅
- Mobile browsers: Full support on iOS Safari and Chrome Android ✅

## Development Tips

### Hot Module Replacement
Vite provides instant updates during development. Just save files and see changes immediately.

### Debugging IndexedDB
1. Open DevTools → Application → Storage → IndexedDB
2. View "GeoHandoverDB" → "handovers" store
3. Inspect saved handover data

### Testing PWA Install
1. Build and serve production build
2. Open in Chrome/Edge
3. Look for install prompt in address bar
4. Install to home screen on mobile

### Clearing Data
```javascript
// Run in browser console to clear all data:
indexedDB.deleteDatabase('GeoHandoverDB');
localStorage.clear();
location.reload();
```

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build fails
```bash
# Check Node version (need 16+)
node --version

# Update if needed
nvm install 16
nvm use 16
```

### Service worker not updating
```bash
# Clear old service workers
# DevTools → Application → Service Workers → Unregister
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Create icon-512.png
3. ✅ Test in development mode
4. ✅ Fill in sample handover
5. ✅ Test PDF export
6. ✅ Test offline mode
7. ✅ Build for production
8. ✅ Deploy to hosting
9. ✅ Test on mobile devices
10. ✅ Share with team
