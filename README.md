# Geo Shift Handover

An offline-first web application for exploration drilling geologists to create professional shift handover documents with photos, signatures, and swing/rotation tracking.

## Features

- **Offline-First**: Works without internet connection after initial load
- **Professional PDFs**: Generate clean, formatted handover documents
- **Photo Management**: Attach up to 6 photos with automatic compression
- **Digital Signatures**: Sign handovers with finger/stylus on touchscreen
- **Swing Tracking**: Track rotation schedules and changeover dates
- **Local Storage**: Save and reopen drafts using IndexedDB
- **Mobile Optimized**: Large touch-friendly buttons, works on phones and tablets
- **WhatsApp Export**: Copy plain text summaries for messaging apps
- **Nothing Notable Mode**: Quick-fill for routine shifts

## Tech Stack

- **Vanilla JavaScript** - No framework overhead
- **Vite** - Fast build tool with HMR
- **pdf-lib** - Client-side PDF generation
- **idb** - IndexedDB wrapper
- **PWA** - Progressive Web App with service worker

## Installation

### Prerequisites

- Node.js 16+ and npm/yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

   Open http://localhost:5173 in your browser

3. **Build for production:**
   ```bash
   npm run build
   ```

   Output will be in the `dist/` folder

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Deployment

### Static Hosting (Netlify, Vercel, GitHub Pages)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider

### Local Network Deployment

For offline use in remote locations:

1. Build the project
2. Copy the `dist/` folder to a local server
3. Serve over local network:
   ```bash
   cd dist
   npx serve -s
   ```
4. Access from mobile devices on same network

## Usage

### Creating a Handover

1. **Fill in basic details:**
   - Project name, Hole ID, Drill type
   - Shift (Day/Night), Date, Geologist name

2. **Set swing information:**
   - Swing start date (auto-calculates from handover date)
   - Swing length in days (default 17)
   - App shows current swing day and next changeover date

3. **Enter drilling data:**
   - Start and end depths (required)
   - Ground conditions (required)
   - Geological observations (optional, toggle to show)
   - Any drilling issues or safety concerns

4. **Add instructions:**
   - At least one instruction required
   - Up to 3 bullet points, max 120 chars each

5. **Optional:**
   - Add up to 6 photos with captions
   - Sign with signature pad
   - Use "Nothing Notable Mode" for routine shifts

6. **Export:**
   - **Export PDF**: Downloads formatted PDF with filename:
     `{holeId}_{shift}_{date}_{endDepth}m_handover.pdf`
   - **Copy for WhatsApp**: Copies plain text summary to clipboard
   - **Save Draft**: Saves to local storage for later

### Managing Drafts

- **Drafts Tab**: View all saved handovers
- **Load**: Reload a saved handover to edit
- **Delete**: Remove old handovers

### This Swing Panel

- Shows current swing start date, day number, and next changeover
- Lists last 7 handovers in the current swing
- Tap any handover to open and edit

## Form Fields Reference

### Required Fields
- Hole ID
- Drill Type (DD/RC)
- Shift (Day/Night)
- Date
- Geologist Name
- Swing Start Date
- Swing Length
- Start Depth
- End Depth
- Ground Condition
- At least one Instruction
- Safety & Risk responses (Yes requires description)

### Optional Fields
- Project name
- Rig/Contractor
- Current bit depth
- Progress notes
- Geological observations (lithology, alteration, mineralization, structure)
- Drilling issues (checkboxes with notes)
- Photos (0-6)
- Signature

## File Naming Convention

PDFs are automatically named:
```
{holeId}_{shift}_{date}_{endDepth}m_handover.pdf
```

Example:
```
DDH023_Night_2026-01-05_142.6m_handover.pdf
```

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+

**Note:** For best offline experience, use Chrome or Edge.

## Offline Mode

The app works offline after first load:

1. Visit the app once while online
2. Service worker caches all assets
3. IndexedDB stores all handover data locally
4. No internet required for creating/editing handovers
5. PDFs generated entirely in browser

## Data Storage

All data stored locally using:
- **IndexedDB** for handover documents, photos, and signatures
- **Service Worker Cache** for app assets (HTML/CSS/JS)

**Important:** Data is stored per-device. Export PDFs regularly as backups.

## Troubleshooting

### App won't load offline
- Ensure you visited while online first
- Clear browser cache and reload
- Check browser supports service workers

### Photos won't compress
- Check file is a valid image (JPG/PNG/GIF)
- Try smaller source images
- Max 6 photos supported

### PDF export fails
- Check all required fields filled
- Ensure depths are valid (end > start)
- If safety concern marked, description required

### Data not saving
- Check browser IndexedDB enabled
- Clear old data if storage full
- Export PDFs before clearing browser data

## Sample Data

Click "Load Sample" button to populate form with example data for testing.

## Development

### Project Structure
```
geo-shift-handover/
├── src/
│   ├── main.js          # App entry point
│   ├── db.js            # IndexedDB operations
│   ├── swing.js         # Swing calculations
│   ├── photos.js        # Photo handling
│   ├── signature.js     # Signature pad
│   ├── pdf.js           # PDF generation
│   ├── textExport.js    # Plain text export
│   ├── ui.js            # UI helpers
│   └── styles.css       # Styles
├── public/
│   └── manifest.json    # PWA manifest
├── index.html           # Main HTML
├── vite.config.js       # Vite config
└── package.json
```

### Adding New Fields

1. Add input to `index.html`
2. Update `collectFormData()` in `main.js`
3. Update `loadFormData()` in `main.js`
4. Add to PDF layout in `pdf.js`
5. Add to text export in `textExport.js`

## License

MIT License - Free for personal and commercial use

## Support

For issues or feature requests, contact your IT administrator or project lead.

## Version History

**v1.0.0** (2026-01-05)
- Initial release
- Basic handover form with all geo-specific fields
- Swing/rotation tracking
- Photo compression and management
- Signature capture
- PDF export with professional layout
- Plain text export for messaging
- Offline-first PWA
- IndexedDB storage
- Drafts management
- "This Swing" panel
- "Nothing Notable" quick mode
