import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { calculateSwingDay, calculateNextChangeover, formatDate } from './swing.js';

const COLORS = {
  primary: rgb(0.102, 0.278, 0.165), // #1a472a
  text: rgb(0.133, 0.133, 0.133),
  lightGray: rgb(0.9, 0.9, 0.9),
  white: rgb(1, 1, 1)
};

/**
 * Sanitize text for PDF WinAnsi encoding
 * Replaces unsupported characters with ASCII equivalents
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
  if (!text) return '';

  return text
    .replace(/•/g, '-')   // Bullet point to dash
    .replace(/→/g, '->')  // Arrow to ASCII
    .replace(/←/g, '<-')  // Left arrow
    .replace(/↑/g, '^')   // Up arrow
    .replace(/↓/g, 'v')   // Down arrow
    .replace(/°/g, 'deg') // Degree symbol
    .replace(/≥/g, '>=')  // Greater than or equal
    .replace(/≤/g, '<=')  // Less than or equal
    .replace(/±/g, '+/-') // Plus-minus
    .replace(/×/g, 'x')   // Multiplication
    .replace(/÷/g, '/')   // Division
    .replace(/–/g, '-')   // En dash
    .replace(/—/g, '--')  // Em dash
    .replace(/'/g, "'")   // Smart quotes
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/…/g, '...')
    // Replace any other non-ASCII characters with '?'
    .replace(/[^\x00-\x7F]/g, '?');
}

/**
 * Generate PDF from form data
 * @param {Object} formData - Form data
 * @param {Array} photos - Array of photo objects
 * @param {Object} signature - Signature data
 * @returns {Promise<Uint8Array>} PDF bytes
 */
export async function generatePDF(formData, photos, signature) {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Page 1: Main handover content
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  let yPos = height - 50;

  // Helper function to check and add new page if needed
  const checkNewPage = (requiredSpace = 100) => {
    if (yPos < requiredSpace) {
      page = pdfDoc.addPage([595, 842]);
      yPos = height - 50;
    }
  };

  // Header
  yPos = drawHeader(page, formData, timesRomanBold, timesRoman, yPos, width);

  // Swing Information
  checkNewPage(80);
  yPos = drawSwingInfo(page, formData, timesRomanBold, timesRoman, yPos, width);

  // Depths & Progress
  checkNewPage(80);
  yPos = drawDepthsSection(page, formData, timesRomanBold, timesRoman, yPos, width);

  // Ground Conditions
  checkNewPage(80);
  yPos = drawGroundConditions(page, formData, timesRomanBold, timesRoman, yPos, width);

  // Geological Observations
  checkNewPage(80);
  yPos = drawGeologicalObservations(page, formData, timesRomanBold, timesRoman, yPos, width);

  // Drilling Issues
  checkNewPage(80);
  yPos = drawDrillingIssues(page, formData, timesRomanBold, timesRoman, yPos, width);

  // Safety & Risk
  checkNewPage(100);
  yPos = drawSafetyRisk(page, formData, timesRomanBold, timesRoman, yPos, width);

  // Instructions
  checkNewPage(80);
  yPos = drawInstructions(page, formData, timesRomanBold, timesRoman, yPos, width);

  // Signature
  if (signature && signature.data) {
    checkNewPage(150);
    yPos = await drawSignature(page, pdfDoc, signature, formData, timesRomanBold, timesRoman, yPos, width);
  }

  // Photos page (if any)
  if (photos && photos.length > 0) {
    await drawPhotosPage(pdfDoc, photos, timesRomanBold, timesRoman);
  }

  return await pdfDoc.save();
}

function drawHeader(page, formData, boldFont, regularFont, yPos, pageWidth) {
  const { holeId, shift, date, project, geologist, drillType, rigContractor } = formData;

  // Title
  page.drawText('SHIFT HANDOVER REPORT', {
    x: 50,
    y: yPos,
    size: 20,
    font: boldFont,
    color: COLORS.primary
  });
  yPos -= 30;

  // Project (if provided)
  if (project) {
    page.drawText(sanitizeText(`Project: ${project}`), {
      x: 50,
      y: yPos,
      size: 11,
      font: regularFont,
      color: COLORS.text
    });
    yPos -= 18;
  }

  // Key details in two columns
  const leftCol = 50;
  const rightCol = 320;

  page.drawText(sanitizeText(`Hole ID: ${holeId}`), {
    x: leftCol,
    y: yPos,
    size: 11,
    font: boldFont,
    color: COLORS.text
  });

  page.drawText(sanitizeText(`Drill Type: ${drillType}`), {
    x: rightCol,
    y: yPos,
    size: 11,
    font: regularFont,
    color: COLORS.text
  });
  yPos -= 18;

  page.drawText(sanitizeText(`Shift: ${shift}`), {
    x: leftCol,
    y: yPos,
    size: 11,
    font: regularFont,
    color: COLORS.text
  });

  page.drawText(`Date: ${formatDate(date)}`, {
    x: rightCol,
    y: yPos,
    size: 11,
    font: regularFont,
    color: COLORS.text
  });
  yPos -= 18;

  page.drawText(sanitizeText(`Geologist: ${geologist}`), {
    x: leftCol,
    y: yPos,
    size: 11,
    font: regularFont,
    color: COLORS.text
  });

  if (rigContractor) {
    page.drawText(sanitizeText(`Rig/Contractor: ${rigContractor}`), {
      x: rightCol,
      y: yPos,
      size: 11,
      font: regularFont,
      color: COLORS.text
    });
  }

  yPos -= 25;

  // Separator line
  page.drawLine({
    start: { x: 50, y: yPos },
    end: { x: pageWidth - 50, y: yPos },
    thickness: 2,
    color: COLORS.primary
  });

  return yPos - 20;
}

function drawSwingInfo(page, formData, boldFont, regularFont, yPos, pageWidth) {
  const { swingStartDate, swingLength, date, incomingGeologist, outgoingGeologist } = formData;

  if (!swingStartDate) return yPos;

  const swingDay = calculateSwingDay(swingStartDate, date, swingLength);
  const nextChangeover = calculateNextChangeover(swingStartDate, swingLength);

  // Section header
  page.drawRectangle({
    x: 50,
    y: yPos - 15,
    width: pageWidth - 100,
    height: 20,
    color: COLORS.lightGray
  });

  page.drawText('SWING / ROTATION', {
    x: 55,
    y: yPos - 10,
    size: 12,
    font: boldFont,
    color: COLORS.primary
  });
  yPos -= 30;

  const leftCol = 50;
  const rightCol = 320;

  page.drawText(`Swing Start: ${formatDate(swingStartDate)}`, {
    x: leftCol,
    y: yPos,
    size: 10,
    font: regularFont,
    color: COLORS.text
  });

  page.drawText(`Swing Day: ${swingDay} of ${swingLength}`, {
    x: rightCol,
    y: yPos,
    size: 10,
    font: boldFont,
    color: COLORS.primary
  });
  yPos -= 15;

  page.drawText(`Next Changeover: ${formatDate(nextChangeover)}`, {
    x: leftCol,
    y: yPos,
    size: 10,
    font: regularFont,
    color: COLORS.text
  });
  yPos -= 15;

  if (outgoingGeologist || incomingGeologist) {
    if (outgoingGeologist) {
      page.drawText(sanitizeText(`Outgoing: ${outgoingGeologist}`), {
        x: leftCol,
        y: yPos,
        size: 10,
        font: regularFont,
        color: COLORS.text
      });
    }

    if (incomingGeologist) {
      page.drawText(sanitizeText(`Incoming: ${incomingGeologist}`), {
        x: rightCol,
        y: yPos,
        size: 10,
        font: regularFont,
        color: COLORS.text
      });
    }
    yPos -= 15;
  }

  return yPos - 10;
}

function drawDepthsSection(page, formData, boldFont, regularFont, yPos, pageWidth) {
  const { startDepth, endDepth, currentBitDepth, progressNotes } = formData;

  // Section header
  page.drawRectangle({
    x: 50,
    y: yPos - 15,
    width: pageWidth - 100,
    height: 20,
    color: COLORS.lightGray
  });

  page.drawText('DEPTHS & PROGRESS', {
    x: 55,
    y: yPos - 10,
    size: 12,
    font: boldFont,
    color: COLORS.primary
  });
  yPos -= 30;

  const advance = (endDepth - startDepth).toFixed(1);
  page.drawText(`Start Depth: ${startDepth}m  ->  End Depth: ${endDepth}m  (${advance}m advance)`, {
    x: 50,
    y: yPos,
    size: 11,
    font: boldFont,
    color: COLORS.text
  });
  yPos -= 18;

  if (currentBitDepth) {
    page.drawText(`Current Bit Depth: ${currentBitDepth}m`, {
      x: 50,
      y: yPos,
      size: 10,
      font: regularFont,
      color: COLORS.text
    });
    yPos -= 15;
  }

  if (progressNotes) {
    page.drawText(sanitizeText(`Notes: ${progressNotes}`), {
      x: 50,
      y: yPos,
      size: 10,
      font: regularFont,
      color: COLORS.text
    });
    yPos -= 15;
  }

  return yPos - 10;
}

function drawGroundConditions(page, formData, boldFont, regularFont, yPos, pageWidth) {
  const { groundCondition, intervalFrom, intervalTo, recoveryConcern, groundNotes } = formData;

  // Section header
  page.drawRectangle({
    x: 50,
    y: yPos - 15,
    width: pageWidth - 100,
    height: 20,
    color: COLORS.lightGray
  });

  page.drawText('GROUND CONDITIONS', {
    x: 55,
    y: yPos - 10,
    size: 12,
    font: boldFont,
    color: COLORS.primary
  });
  yPos -= 30;

  let conditionText = `Condition: ${groundCondition}`;
  if (intervalFrom && intervalTo) {
    conditionText += ` (${intervalFrom}m - ${intervalTo}m)`;
  }

  page.drawText(sanitizeText(conditionText), {
    x: 50,
    y: yPos,
    size: 10,
    font: regularFont,
    color: COLORS.text
  });
  yPos -= 15;

  if (recoveryConcern === 'Yes') {
    page.drawText('Recovery Concern: YES', {
      x: 50,
      y: yPos,
      size: 10,
      font: boldFont,
      color: rgb(0.77, 0.12, 0.23)
    });
    yPos -= 15;
  }

  if (groundNotes) {
    const wrappedNotes = wrapText(sanitizeText(groundNotes), 80);
    wrappedNotes.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPos,
        size: 10,
        font: regularFont,
        color: COLORS.text
      });
      yPos -= 15;
    });
  }

  return yPos - 10;
}

function drawGeologicalObservations(page, formData, boldFont, regularFont, yPos, pageWidth) {
  const { lithologyChange, alterationChange, mineralizationObserved, structureFaulting } = formData;

  const hasAnyObs = lithologyChange || alterationChange || mineralizationObserved || structureFaulting;
  if (!hasAnyObs) return yPos;

  // Section header
  page.drawRectangle({
    x: 50,
    y: yPos - 15,
    width: pageWidth - 100,
    height: 20,
    color: COLORS.lightGray
  });

  page.drawText('GEOLOGICAL OBSERVATIONS', {
    x: 55,
    y: yPos - 10,
    size: 12,
    font: boldFont,
    color: COLORS.primary
  });
  yPos -= 30;

  if (lithologyChange) {
    page.drawText('Lithology:', {
      x: 50,
      y: yPos,
      size: 10,
      font: boldFont,
      color: COLORS.text
    });
    yPos -= 15;

    const wrapped = wrapText(sanitizeText(lithologyChange), 80);
    wrapped.forEach(line => {
      page.drawText(line, {
        x: 60,
        y: yPos,
        size: 10,
        font: regularFont,
        color: COLORS.text
      });
      yPos -= 15;
    });
    yPos -= 5;
  }

  if (alterationChange) {
    page.drawText('Alteration:', {
      x: 50,
      y: yPos,
      size: 10,
      font: boldFont,
      color: COLORS.text
    });
    yPos -= 15;

    const wrapped = wrapText(sanitizeText(alterationChange), 80);
    wrapped.forEach(line => {
      page.drawText(line, {
        x: 60,
        y: yPos,
        size: 10,
        font: regularFont,
        color: COLORS.text
      });
      yPos -= 15;
    });
    yPos -= 5;
  }

  if (mineralizationObserved) {
    page.drawText('Mineralization:', {
      x: 50,
      y: yPos,
      size: 10,
      font: boldFont,
      color: COLORS.text
    });
    yPos -= 15;

    const wrapped = wrapText(sanitizeText(mineralizationObserved), 80);
    wrapped.forEach(line => {
      page.drawText(line, {
        x: 60,
        y: yPos,
        size: 10,
        font: regularFont,
        color: COLORS.text
      });
      yPos -= 15;
    });
    yPos -= 5;
  }

  if (structureFaulting) {
    page.drawText('Structure/Faulting:', {
      x: 50,
      y: yPos,
      size: 10,
      font: boldFont,
      color: COLORS.text
    });
    yPos -= 15;

    const wrapped = wrapText(sanitizeText(structureFaulting), 80);
    wrapped.forEach(line => {
      page.drawText(line, {
        x: 60,
        y: yPos,
        size: 10,
        font: regularFont,
        color: COLORS.text
      });
      yPos -= 15;
    });
  }

  return yPos - 10;
}

function drawDrillingIssues(page, formData, boldFont, regularFont, yPos, pageWidth) {
  const issues = formData.drillingIssues || [];
  if (issues.length === 0) return yPos;

  // Section header
  page.drawRectangle({
    x: 50,
    y: yPos - 15,
    width: pageWidth - 100,
    height: 20,
    color: COLORS.lightGray
  });

  page.drawText('DRILLING ISSUES', {
    x: 55,
    y: yPos - 10,
    size: 12,
    font: boldFont,
    color: COLORS.primary
  });
  yPos -= 30;

  issues.forEach(issue => {
    page.drawText(sanitizeText(`• ${issue.type}`), {
      x: 50,
      y: yPos,
      size: 10,
      font: boldFont,
      color: COLORS.text
    });
    yPos -= 15;

    if (issue.note) {
      const wrapped = wrapText(sanitizeText(issue.note), 75);
      wrapped.forEach(line => {
        page.drawText(line, {
          x: 60,
          y: yPos,
          size: 10,
          font: regularFont,
          color: COLORS.text
        });
        yPos -= 15;
      });
    }
  });

  return yPos - 10;
}

function drawSafetyRisk(page, formData, boldFont, regularFont, yPos, pageWidth) {
  const { safetyGroundStability, safetyGroundStabilityNote, safetyHoleCondition, safetyHoleConditionNote, safetyPadCondition, safetyPadConditionNote } = formData;

  const hasConcerns = safetyGroundStability === 'Yes' || safetyHoleCondition === 'Yes' || safetyPadCondition === 'Yes';

  // Section header
  page.drawRectangle({
    x: 50,
    y: yPos - 15,
    width: pageWidth - 100,
    height: 20,
    color: hasConcerns ? rgb(1, 0.95, 0.8) : COLORS.lightGray
  });

  page.drawText('SAFETY & RISK', {
    x: 55,
    y: yPos - 10,
    size: 12,
    font: boldFont,
    color: hasConcerns ? rgb(0.77, 0.12, 0.23) : COLORS.primary
  });
  yPos -= 30;

  if (!hasConcerns) {
    page.drawText('No safety concerns reported', {
      x: 50,
      y: yPos,
      size: 10,
      font: regularFont,
      color: COLORS.text
    });
    yPos -= 15;
  } else {
    if (safetyGroundStability === 'Yes') {
      page.drawText('WARNING: Ground Stability Concern', {
        x: 50,
        y: yPos,
        size: 10,
        font: boldFont,
        color: rgb(0.77, 0.12, 0.23)
      });
      yPos -= 15;

      if (safetyGroundStabilityNote) {
        const wrapped = wrapText(sanitizeText(safetyGroundStabilityNote), 75);
        wrapped.forEach(line => {
          page.drawText(line, {
            x: 60,
            y: yPos,
            size: 10,
            font: regularFont,
            color: COLORS.text
          });
          yPos -= 15;
        });
      }
      yPos -= 5;
    }

    if (safetyHoleCondition === 'Yes') {
      page.drawText('WARNING: Hole Condition Concern', {
        x: 50,
        y: yPos,
        size: 10,
        font: boldFont,
        color: rgb(0.77, 0.12, 0.23)
      });
      yPos -= 15;

      if (safetyHoleConditionNote) {
        const wrapped = wrapText(sanitizeText(safetyHoleConditionNote), 75);
        wrapped.forEach(line => {
          page.drawText(line, {
            x: 60,
            y: yPos,
            size: 10,
            font: regularFont,
            color: COLORS.text
          });
          yPos -= 15;
        });
      }
      yPos -= 5;
    }

    if (safetyPadCondition === 'Yes') {
      page.drawText('WARNING: Pad Condition Concern', {
        x: 50,
        y: yPos,
        size: 10,
        font: boldFont,
        color: rgb(0.77, 0.12, 0.23)
      });
      yPos -= 15;

      if (safetyPadConditionNote) {
        const wrapped = wrapText(sanitizeText(safetyPadConditionNote), 75);
        wrapped.forEach(line => {
          page.drawText(line, {
            x: 60,
            y: yPos,
            size: 10,
            font: regularFont,
            color: COLORS.text
          });
          yPos -= 15;
        });
      }
    }
  }

  return yPos - 10;
}

function drawInstructions(page, formData, boldFont, regularFont, yPos, pageWidth) {
  const { instruction1, instruction2, instruction3 } = formData;

  // Section header
  page.drawRectangle({
    x: 50,
    y: yPos - 15,
    width: pageWidth - 100,
    height: 20,
    color: COLORS.lightGray
  });

  page.drawText('INSTRUCTIONS TO NEXT SHIFT', {
    x: 55,
    y: yPos - 10,
    size: 12,
    font: boldFont,
    color: COLORS.primary
  });
  yPos -= 30;

  if (instruction1) {
    page.drawText(sanitizeText(`• ${instruction1}`), {
      x: 50,
      y: yPos,
      size: 10,
      font: regularFont,
      color: COLORS.text
    });
    yPos -= 15;
  }

  if (instruction2) {
    page.drawText(sanitizeText(`• ${instruction2}`), {
      x: 50,
      y: yPos,
      size: 10,
      font: regularFont,
      color: COLORS.text
    });
    yPos -= 15;
  }

  if (instruction3) {
    page.drawText(sanitizeText(`• ${instruction3}`), {
      x: 50,
      y: yPos,
      size: 10,
      font: regularFont,
      color: COLORS.text
    });
    yPos -= 15;
  }

  return yPos - 10;
}

async function drawSignature(page, pdfDoc, signature, formData, boldFont, regularFont, yPos, pageWidth) {
  yPos -= 20;

  // Section header
  page.drawRectangle({
    x: 50,
    y: yPos - 15,
    width: pageWidth - 100,
    height: 20,
    color: COLORS.lightGray
  });

  page.drawText('SIGNATURE', {
    x: 55,
    y: yPos - 10,
    size: 12,
    font: boldFont,
    color: COLORS.primary
  });
  yPos -= 35;

  try {
    // Embed signature image
    const signatureImage = await pdfDoc.embedPng(signature.data);
    const signatureDims = signatureImage.scale(0.3);

    page.drawImage(signatureImage, {
      x: 50,
      y: yPos - signatureDims.height,
      width: signatureDims.width,
      height: signatureDims.height
    });

    yPos -= signatureDims.height + 10;
  } catch (error) {
    console.error('Error embedding signature:', error);
    console.error('Signature data type:', signature.data ? signature.data.substring(0, 50) : 'undefined');
    // Continue without signature image
  }

  // Signed by
  const signedBy = formData.signedBy || formData.geologist || 'Unknown';
  page.drawText(sanitizeText(`Signed by: ${signedBy}`), {
    x: 50,
    y: yPos,
    size: 10,
    font: regularFont,
    color: COLORS.text
  });
  yPos -= 15;

  // Timestamp
  if (signature.timestamp) {
    const date = new Date(signature.timestamp);
    const dateStr = date.toLocaleString('en-GB');
    page.drawText(`Date: ${dateStr}`, {
      x: 50,
      y: yPos,
      size: 10,
      font: regularFont,
      color: COLORS.text
    });
    yPos -= 15;
  }

  return yPos;
}

async function drawPhotosPage(pdfDoc, photos, boldFont, regularFont) {
  let page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  let yPos = height - 50;

  // Title
  page.drawText('PHOTOS', {
    x: 50,
    y: yPos,
    size: 16,
    font: boldFont,
    color: COLORS.primary
  });
  yPos -= 40;

  const photosPerRow = 2;
  const photoWidth = 220;
  const photoHeight = 165;
  const xMargin = 50;
  const xSpacing = 25;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const col = i % photosPerRow;
    const xPos = xMargin + col * (photoWidth + xSpacing);

    // Check if we need a new page
    if (yPos < photoHeight + 100) {
      page = pdfDoc.addPage([595, 842]);
      yPos = height - 50;
    }

    try {
      // Embed photo
      const imageData = photo.data;
      let image;

      if (imageData.startsWith('data:image/png')) {
        image = await pdfDoc.embedPng(imageData);
      } else if (imageData.startsWith('data:image/jpeg') || imageData.startsWith('data:image/jpg')) {
        image = await pdfDoc.embedJpg(imageData);
      } else {
        // Default to JPEG for unknown formats
        image = await pdfDoc.embedJpg(imageData);
      }

      // Calculate dimensions to fit
      const imgDims = image.scale(1);
      const scale = Math.min(photoWidth / imgDims.width, photoHeight / imgDims.height);
      const scaledWidth = imgDims.width * scale;
      const scaledHeight = imgDims.height * scale;

      page.drawImage(image, {
        x: xPos,
        y: yPos - scaledHeight,
        width: scaledWidth,
        height: scaledHeight
      });

      // Draw caption
      const captionY = yPos - scaledHeight - 15;
      const caption = photo.caption || `Photo ${i + 1}`;
      const wrappedCaption = wrapText(sanitizeText(caption), 30);

      wrappedCaption.forEach((line, idx) => {
        page.drawText(line, {
          x: xPos,
          y: captionY - (idx * 12),
          size: 9,
          font: regularFont,
          color: COLORS.text
        });
      });

      // Move to next row after 2 photos
      if (col === photosPerRow - 1) {
        yPos -= photoHeight + 60;
      }
    } catch (error) {
      console.error('Error embedding photo:', error);
      console.error('Photo data type:', photo.data ? photo.data.substring(0, 50) : 'undefined');
      // Continue with other photos
    }
  }
}

function wrapText(text, maxChars) {
  if (!text) return [];

  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * Download PDF file
 * @param {Uint8Array} pdfBytes
 * @param {string} filename
 */
export function downloadPDF(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate PDF filename
 * @param {Object} formData
 * @returns {string}
 */
export function generatePDFFilename(formData) {
  const { holeId, shift, date, endDepth } = formData;
  const sanitizedHoleId = holeId.replace(/[^a-zA-Z0-9]/g, '');
  const sanitizedShift = shift.replace(/[^a-zA-Z0-9]/g, '');

  return `${sanitizedHoleId}_${sanitizedShift}_${date}_${endDepth}m_handover.pdf`;
}
