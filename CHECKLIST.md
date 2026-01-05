# Pre-Deployment Checklist

## 1. Initial Setup ✅

- [ ] Node.js 16+ installed (`node --version`)
- [ ] Navigate to project folder: `cd geo-shift-handover`
- [ ] Install dependencies: `npm install`
- [ ] Verify no errors in installation

## 2. Generate Icon 🎨

- [ ] Open `generate-icon.html` in a web browser
- [ ] Click "Download icon-512.png" button
- [ ] Save file as `icon-512.png`
- [ ] Move/copy to `public/` folder
- [ ] Verify file is 512x512 pixels PNG

## 3. Development Testing 🧪

### Start Dev Server
- [ ] Run: `npm run dev`
- [ ] Open http://localhost:5173 in browser
- [ ] Verify app loads without errors

### Test Basic Form
- [ ] Click "Load Sample" button
- [ ] Verify all fields populated correctly
- [ ] Check swing day calculation shows "Day X of 17"
- [ ] Check next changeover date displayed

### Test Swing Calculations
- [ ] Change swing start date
- [ ] Change handover date
- [ ] Verify swing day updates automatically
- [ ] Change swing length to 15
- [ ] Verify calculations update

### Test Photos
- [ ] Click "Add Photos"
- [ ] Upload 2-3 test images
- [ ] Verify thumbnails show
- [ ] Add captions to each
- [ ] Test reorder (↑↓ buttons)
- [ ] Test remove (× button)
- [ ] Verify photo count shows "3 / 6"

### Test Signature
- [ ] Draw signature on canvas
- [ ] Verify timestamp updates
- [ ] Click "Clear" button
- [ ] Draw new signature

### Test PDF Export
- [ ] Fill in all required fields (or use sample data)
- [ ] Click "Export PDF"
- [ ] Verify PDF downloads
- [ ] Open PDF and check:
  - [ ] All sections present
  - [ ] Swing day shown correctly
  - [ ] Photos on page 2 (if added)
  - [ ] Signature visible
  - [ ] Filename format correct: `{holeId}_{shift}_{date}_{endDepth}m_handover.pdf`

### Test Text Export
- [ ] Fill in form (or use sample data)
- [ ] Click "Copy for WhatsApp"
- [ ] Paste into text editor
- [ ] Verify format looks good
- [ ] Check swing day included

### Test Save Draft
- [ ] Fill in partial form
- [ ] Click "Save Draft"
- [ ] Verify success toast shows

### Test Drafts Tab
- [ ] Click "Drafts" tab
- [ ] Verify saved draft appears
- [ ] Click "Load" button
- [ ] Verify form repopulated
- [ ] Return to "Drafts" tab
- [ ] Click "Delete" button
- [ ] Confirm deletion
- [ ] Verify draft removed

### Test This Swing Tab
- [ ] Create and save 2-3 handovers
- [ ] Click "This Swing" tab
- [ ] Verify current swing info displays
- [ ] Verify recent handovers list shows
- [ ] Click a handover to load it

### Test Validation
- [ ] Clear form
- [ ] Try to export PDF without filling required fields
- [ ] Verify validation errors show
- [ ] Fill end depth less than start depth
- [ ] Try to export
- [ ] Verify error: "End depth must be greater than start depth"
- [ ] Mark safety concern as "Yes"
- [ ] Leave description empty
- [ ] Try to export
- [ ] Verify error about required description

### Test Mobile Responsiveness
- [ ] Open browser DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M or Cmd+Shift+M)
- [ ] Test at 375px width (mobile)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1920px width (desktop)
- [ ] Verify all buttons are tappable
- [ ] Verify signature pad works with touch

### Test Nothing Notable Mode
- [ ] Clear form
- [ ] Click "Nothing Notable Mode"
- [ ] Verify ground condition set to "Competent"
- [ ] Verify notes auto-filled
- [ ] Click button again to exit mode

## 4. Offline Testing 🔌

- [ ] Open app in browser
- [ ] Open DevTools → Application → Service Workers
- [ ] Wait for service worker to activate
- [ ] Check "Offline" checkbox
- [ ] Refresh page
- [ ] Verify app still loads
- [ ] Create a handover
- [ ] Export PDF
- [ ] Verify everything works offline
- [ ] Uncheck "Offline" to restore connection

## 5. Production Build 🏗️

- [ ] Run: `npm run build`
- [ ] Verify build completes without errors
- [ ] Check `dist/` folder created
- [ ] Run: `npm run preview`
- [ ] Open preview URL (usually http://localhost:4173)
- [ ] Test basic functionality in preview
- [ ] Check console for errors

## 6. Browser Compatibility 🌐

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (if on Windows)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android

## 7. Data Persistence 💾

- [ ] Create and save a handover
- [ ] Close browser completely
- [ ] Reopen browser
- [ ] Navigate to app
- [ ] Click "Drafts" tab
- [ ] Verify saved handover still there

## 8. Storage Management 🗄️

- [ ] Open DevTools → Application → Storage → IndexedDB
- [ ] Expand "GeoHandoverDB"
- [ ] Expand "handovers" object store
- [ ] Verify saved data visible
- [ ] Test clearing data (if needed):
  ```javascript
  // In browser console:
  indexedDB.deleteDatabase('GeoHandoverDB');
  location.reload();
  ```

## 9. Performance ⚡

- [ ] Open DevTools → Network tab
- [ ] Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- [ ] Check total load time < 2 seconds
- [ ] Check total transfer size < 500KB
- [ ] Test PDF generation time < 3 seconds

## 10. PWA Install 📱

### Desktop
- [ ] Look for install icon in address bar
- [ ] Click to install
- [ ] Verify app opens as standalone window
- [ ] Test functionality in installed app

### Mobile (iOS Safari)
- [ ] Open app in Safari
- [ ] Tap Share button
- [ ] Tap "Add to Home Screen"
- [ ] Open from home screen
- [ ] Verify runs in standalone mode

### Mobile (Chrome Android)
- [ ] Open app in Chrome
- [ ] Look for "Add to Home Screen" prompt
- [ ] Install app
- [ ] Open from home screen
- [ ] Test camera access for photos

## 11. Deployment 🚀

Choose deployment method:

### Option A: Netlify
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Deploy: `netlify deploy --prod --dir=dist`
- [ ] Copy deployment URL
- [ ] Test deployed app

### Option B: Vercel
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Deploy: `vercel --prod`
- [ ] Copy deployment URL
- [ ] Test deployed app

### Option C: GitHub Pages
- [ ] Create GitHub repository
- [ ] Push code to repository
- [ ] Enable GitHub Pages (Settings → Pages)
- [ ] Select source: gh-pages branch or /dist folder
- [ ] Wait for deployment
- [ ] Test deployed app

### Option D: Local Server (Offline Use)
- [ ] Copy `dist/` folder to local server
- [ ] Serve: `cd dist && npx serve -s -p 3000`
- [ ] Access from network devices
- [ ] Test on multiple devices on same network

## 12. Post-Deployment Testing ✔️

After deployment:
- [ ] Open deployed URL
- [ ] Test complete workflow (create → export → save)
- [ ] Test on mobile device
- [ ] Test offline mode
- [ ] Test PWA install
- [ ] Share URL with team member for testing

## 13. Documentation Review 📚

- [ ] Read README.md
- [ ] Verify all instructions clear
- [ ] Test setup instructions with fresh clone
- [ ] Read QUICK_REFERENCE.md
- [ ] Verify all features documented

## 14. Final Checks ✨

- [ ] All required fields working
- [ ] All optional fields working
- [ ] Photos compress and embed correctly
- [ ] Signature captures and embeds correctly
- [ ] PDF filename format correct
- [ ] Swing calculations accurate
- [ ] Validation prevents invalid submissions
- [ ] Error messages are helpful
- [ ] Success messages show
- [ ] No console errors
- [ ] Works offline
- [ ] Mobile-friendly
- [ ] Fast performance

## 15. User Training Materials 👥

Prepare for team:
- [ ] Share README.md
- [ ] Share QUICK_REFERENCE.md
- [ ] Create demo handover
- [ ] Export sample PDF to show
- [ ] Prepare troubleshooting guide
- [ ] Schedule training session (if needed)

---

## Common Issues & Solutions

### Issue: App won't install dependencies
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Icon not showing in PWA
**Solution:**
- Verify icon-512.png in public/ folder
- Rebuild: `npm run build`
- Hard refresh browser cache

### Issue: Service worker not updating
**Solution:**
- DevTools → Application → Service Workers
- Click "Unregister"
- Hard refresh page

### Issue: PDF export fails
**Solution:**
- Check all required fields filled
- Verify end depth > start depth
- Check browser console for specific error

### Issue: Photos won't upload
**Solution:**
- Verify files are images (JPG/PNG/GIF)
- Check not exceeding 6 photos
- Try smaller file sizes

### Issue: Offline mode doesn't work
**Solution:**
- Visit app online first
- Wait for service worker to install
- Check DevTools → Application → Service Workers shows "activated"

---

## Ready for Production? ✅

All checkboxes ticked? You're ready to deploy! 🚀

**Final command:**
```bash
npm run build && netlify deploy --prod --dir=dist
```

Or your chosen deployment method.

**Post-deployment:**
Share the deployed URL with your team and enjoy shift handovers made easy!
