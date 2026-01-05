import { calculateSwingDay, formatDate } from './swing.js';

/**
 * Generate plain text summary for WhatsApp/Teams
 * @param {Object} formData - Form data object
 * @returns {string} Plain text summary
 */
export function generateTextSummary(formData) {
  const {
    project,
    holeId,
    shift,
    date,
    geologist,
    startDepth,
    endDepth,
    swingStartDate,
    swingLength,
    groundCondition,
    instruction1,
    instruction2,
    instruction3,
    lithologyChange,
    alterationChange,
    mineralizationObserved,
    structureFaulting,
    progressNotes
  } = formData;

  // Calculate swing day
  const swingDay = calculateSwingDay(swingStartDate, date, swingLength);
  const swingInfo = swingDay ? ` | Swing Day ${swingDay}/${swingLength}` : '';

  // Build header
  const header = `🔷 SHIFT HANDOVER - ${holeId} 🔷\n${shift} Shift | ${formatDate(date)} | ${endDepth}m${swingInfo}`;

  // Build key info
  const depth = `Depth: ${startDepth}m → ${endDepth}m (${(endDepth - startDepth).toFixed(1)}m advance)`;
  const ground = `Ground: ${groundCondition}`;
  const geo = geologist ? `Geologist: ${geologist}` : '';
  const proj = project ? `Project: ${project}` : '';

  const keyInfo = [proj, depth, ground, geo].filter(Boolean).join('\n');

  // Progress notes
  let progress = '';
  if (progressNotes) {
    progress = `\nProgress: ${progressNotes}`;
  }

  // Geological observations
  const geoObs = [];
  if (lithologyChange) geoObs.push(`• Lithology: ${lithologyChange}`);
  if (alterationChange) geoObs.push(`• Alteration: ${alterationChange}`);
  if (mineralizationObserved) geoObs.push(`• Mineralization: ${mineralizationObserved}`);
  if (structureFaulting) geoObs.push(`• Structure: ${structureFaulting}`);

  let observations = '';
  if (geoObs.length > 0) {
    observations = `\nGeo Observations:\n${geoObs.join('\n')}`;
  }

  // Instructions
  const instructions = [];
  if (instruction1) instructions.push(`• ${instruction1}`);
  if (instruction2) instructions.push(`• ${instruction2}`);
  if (instruction3) instructions.push(`• ${instruction3}`);

  const instructionsText = `\nInstructions for Next Shift:\n${instructions.join('\n')}`;

  // Combine all sections
  const sections = [
    header,
    keyInfo,
    progress,
    observations,
    instructionsText
  ].filter(Boolean);

  return sections.join('\n');
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
