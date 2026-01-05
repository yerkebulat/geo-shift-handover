let canvas = null;
let ctx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let signatureData = null;
let signatureTimestamp = null;

/**
 * Initialize signature pad
 */
export function initSignaturePad() {
  canvas = document.getElementById('signature-pad');
  if (!canvas) return;

  ctx = canvas.getContext('2d');

  // Set up canvas drawing properties
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Mouse events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  // Touch events
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);

  // Clear button
  const clearBtn = document.getElementById('clear-signature-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearSignature);
  }

  // Fill with white background initially
  clearSignature();
}

/**
 * Get coordinates relative to canvas
 */
function getCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

/**
 * Start drawing
 */
function startDrawing(e) {
  isDrawing = true;
  const coords = getCoordinates(e);
  lastX = coords.x;
  lastY = coords.y;
}

/**
 * Draw on canvas
 */
function draw(e) {
  if (!isDrawing) return;

  const coords = getCoordinates(e);

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(coords.x, coords.y);
  ctx.stroke();

  lastX = coords.x;
  lastY = coords.y;

  // Update signature data
  updateSignatureData();
}

/**
 * Stop drawing
 */
function stopDrawing() {
  if (isDrawing) {
    isDrawing = false;
    updateSignatureData();
  }
}

/**
 * Handle touch start
 */
function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

/**
 * Handle touch move
 */
function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

/**
 * Clear signature
 */
export function clearSignature() {
  if (!ctx) return;

  // Fill with white background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  signatureData = null;
  signatureTimestamp = null;

  updateTimestampDisplay();
}

/**
 * Update signature data and timestamp
 */
function updateSignatureData() {
  if (!canvas) return;

  signatureData = canvas.toDataURL('image/png');
  signatureTimestamp = Date.now();

  updateTimestampDisplay();
}

/**
 * Update timestamp display
 */
function updateTimestampDisplay() {
  const timestampEl = document.getElementById('signatureTimestamp');
  if (!timestampEl) return;

  if (signatureTimestamp) {
    const date = new Date(signatureTimestamp);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    timestampEl.textContent = date.toLocaleString('en-GB', options);
  } else {
    timestampEl.textContent = 'Not signed yet';
  }
}

/**
 * Check if signature exists
 */
export function hasSignature() {
  return signatureData !== null;
}

/**
 * Get signature data
 */
export function getSignature() {
  return {
    data: signatureData,
    timestamp: signatureTimestamp
  };
}

/**
 * Set signature (for loading from saved data)
 */
export function setSignature(data, timestamp) {
  if (!canvas || !ctx || !data) return;

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    signatureData = data;
    signatureTimestamp = timestamp;
    updateTimestampDisplay();
  };
  img.src = data;
}

/**
 * Check if canvas is blank (only white pixels)
 */
export function isSignatureBlank() {
  if (!canvas) return true;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Check if all pixels are white
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // If any pixel is not white, signature exists
    if (r !== 255 || g !== 255 || b !== 255) {
      return false;
    }
  }

  return true;
}
