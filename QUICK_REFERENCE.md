# Geo Shift Handover - Quick Reference Card

## Installation
```bash
npm install
npm run dev
```

## PDF Filename Format
```
{holeId}_{shift}_{date}_{endDepth}m_handover.pdf
Example: DDH023_Night_2026-01-05_142.6m_handover.pdf
```

## Required Fields (Minimum to Export)
- ✅ Hole ID
- ✅ Drill Type (DD/RC)
- ✅ Shift (Day/Night)
- ✅ Date
- ✅ Geologist Name
- ✅ Swing Start Date
- ✅ Swing Length (days)
- ✅ Start Depth (m)
- ✅ End Depth (m)
- ✅ Ground Condition
- ✅ At least 1 Instruction
- ✅ Safety checks (Yes requires description)

## Swing/Rotation Logic

**Auto-calculated fields:**
- **Swing Day**: Based on (Handover Date - Swing Start Date) % Swing Length
- **Next Changeover**: Swing Start Date + (Swing Length - 1) days

**Example:**
- Swing Start: Jan 1
- Swing Length: 17 days
- Handover Date: Jan 5
- → Swing Day: **5 of 17**
- → Next Changeover: **Jan 17**

## Photo Specifications
- **Max photos**: 6
- **Compression**: Longest side max 1600px
- **Quality**: 0.8 JPEG
- **Caption limit**: 80 characters
- **Reorderable**: Use ↑↓ buttons

## Signature
- Draw with mouse/finger/stylus
- Auto-captures timestamp
- "Signed By" defaults to Geologist name
- Embedded as PNG in PDF

## Export Options

### 1. PDF Export
- Downloads formatted PDF
- Includes all sections
- Photos on page 2 (if present)
- Signature at bottom of page 1

### 2. Copy for WhatsApp
- Plain text summary
- Header: Hole ID, shift, date, end depth, swing day
- 4-6 key lines
- Instructions as bullets
- Ready to paste

### 3. Save Draft
- Stores in IndexedDB
- Includes photos and signature
- Can reopen and edit
- Shows in Drafts tab

## Tabs

### 🆕 New Handover
Main form for creating handovers

### 📄 Drafts
- View all saved handovers
- Load to edit
- Delete old ones
- Sorted newest first

### 🔄 This Swing
- Current swing info (start, day, changeover)
- Last 7 handovers in this swing
- Quick access to recent work

## Nothing Notable Mode
**Use when:** Routine shift with no issues

**Effect:**
- Auto-fills "Competent" ground condition
- Adds "No issues observed" notes
- Collapses optional geology sections
- Still requires instructions

**To activate:** Click "Nothing Notable Mode" button

## Keyboard Shortcuts
- Tab through form fields
- Enter to submit (when on buttons)
- Numbers allow decimals (e.g., 142.6)

## Mobile Tips
- Large touch targets (48px min)
- Works with gloves
- Pinch to zoom signature pad
- Use camera or photo library for images
- Install to home screen (PWA)

## Validation Rules
1. End Depth > Start Depth
2. Safety concern "Yes" → Description required
3. At least 1 instruction required
4. Swing Length: 1-60 days
5. Depths allow decimals

## Offline Storage
- **What's saved**: Form data, photos, signatures
- **Where**: IndexedDB (local browser storage)
- **Limit**: ~50MB per device
- **Backup**: Export PDFs regularly

## Troubleshooting

| Issue | Solution |
|-------|----------|
| PDF won't export | Check all required fields filled |
| Depths invalid | End must be > Start |
| Photos not uploading | Max 6 photos, must be images |
| Offline not working | Visit once online first |
| Data not saving | Check browser IndexedDB enabled |
| Swing day wrong | Verify swing start date |

## Data Flow

```
Fill Form → Validate → Choose Export:

1. PDF:
   Form + Photos + Signature → pdf-lib → Download PDF → Save to DB

2. WhatsApp:
   Form → Text Summary → Copy to Clipboard

3. Save Draft:
   Form + Photos + Signature → IndexedDB → Drafts Tab
```

## Sample Data Button
Click "Load Sample" to fill form with realistic example data for testing.

## Field Limits
- Instructions: 120 chars each
- Photo captions: 80 chars
- Text fields: 240 chars max
- Safety notes: 120 chars

## Ground Conditions Options
1. Competent
2. Moderately broken
3. Highly broken
4. Unstable / Washing

## Drilling Issues (Checkboxes)
- Poor Recovery
- Deviation Increasing
- Slow Penetration
- Equipment Issue
- Water Loss / Circulation Issue
- Other (specify)

## Geological Observations (Toggle)
- Lithology Change
- Alteration Change
- Mineralization Observed
- Structure / Faulting

## Safety Checks (Mandatory)
- Ground Stability Concern?
- Hole Condition Concern?
- Pad Condition Concern?

All default to "No". If "Yes", description required.

## Browser DevTools

**View stored data:**
```
DevTools → Application → Storage → IndexedDB → GeoHandoverDB → handovers
```

**Clear all data:**
```javascript
indexedDB.deleteDatabase('GeoHandoverDB');
location.reload();
```

**Test offline:**
```
DevTools → Application → Service Workers → Check "Offline"
```

## Version Info
Built with: Vite, pdf-lib, idb, vanilla JS
PWA: Offline-capable Progressive Web App
Storage: IndexedDB (client-side only)
