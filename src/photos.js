const MAX_PHOTOS = 6;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

let photos = [];

/**
 * Compress an image file
 * @param {File} file - Image file to compress
 * @returns {Promise<{data: string, name: string}>} Compressed image data URL and filename
 */
export async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIMENSION) {
          height = (height * MAX_DIMENSION) / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = (width * MAX_DIMENSION) / height;
          height = MAX_DIMENSION;
        }

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

        resolve({
          data: dataUrl,
          name: file.name
        });
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Add photos from file input
 * @param {FileList} files - Files to add
 * @returns {Promise<void>}
 */
export async function addPhotos(files) {
  const filesToAdd = Math.min(files.length, MAX_PHOTOS - photos.length);

  for (let i = 0; i < filesToAdd; i++) {
    const file = files[i];

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      console.warn('Skipping non-image file:', file.name);
      continue;
    }

    try {
      const compressed = await compressImage(file);
      photos.push({
        id: Date.now() + i,
        data: compressed.data,
        caption: '',
        filename: compressed.name
      });
    } catch (error) {
      console.error('Error compressing image:', error);
    }
  }

  renderPhotos();
}

/**
 * Remove a photo by ID
 * @param {number} photoId
 */
export function removePhoto(photoId) {
  photos = photos.filter(p => p.id !== photoId);
  renderPhotos();
}

/**
 * Update photo caption
 * @param {number} photoId
 * @param {string} caption
 */
export function updatePhotoCaption(photoId, caption) {
  const photo = photos.find(p => p.id === photoId);
  if (photo) {
    photo.caption = caption;
  }
}

/**
 * Move photo up in order
 * @param {number} photoId
 */
export function movePhotoUp(photoId) {
  const index = photos.findIndex(p => p.id === photoId);
  if (index > 0) {
    [photos[index - 1], photos[index]] = [photos[index], photos[index - 1]];
    renderPhotos();
  }
}

/**
 * Move photo down in order
 * @param {number} photoId
 */
export function movePhotoDown(photoId) {
  const index = photos.findIndex(p => p.id === photoId);
  if (index < photos.length - 1) {
    [photos[index], photos[index + 1]] = [photos[index + 1], photos[index]];
    renderPhotos();
  }
}

/**
 * Get all photos
 * @returns {Array} Array of photo objects
 */
export function getPhotos() {
  return [...photos];
}

/**
 * Set photos (for loading from saved data)
 * @param {Array} newPhotos
 */
export function setPhotos(newPhotos) {
  photos = newPhotos || [];
  renderPhotos();
}

/**
 * Clear all photos
 */
export function clearPhotos() {
  photos = [];
  renderPhotos();
}

/**
 * Render photos in the UI
 */
function renderPhotos() {
  const container = document.getElementById('photo-list');
  const countEl = document.querySelector('.photo-count');
  const addBtn = document.getElementById('add-photo-btn');

  if (!container) return;

  // Update count
  if (countEl) {
    countEl.textContent = `${photos.length} / ${MAX_PHOTOS}`;
  }

  // Disable add button if at max
  if (addBtn) {
    addBtn.disabled = photos.length >= MAX_PHOTOS;
  }

  // Clear and render
  container.innerHTML = '';

  photos.forEach((photo, index) => {
    const photoEl = createPhotoElement(photo, index);
    container.appendChild(photoEl);
  });
}

/**
 * Create a photo element
 * @param {Object} photo
 * @param {number} index
 * @returns {HTMLElement}
 */
function createPhotoElement(photo, index) {
  const div = document.createElement('div');
  div.className = 'photo-item';
  div.innerHTML = `
    <img src="${photo.data}" alt="Photo ${index + 1}">
    <div class="photo-actions">
      ${index > 0 ? '<button class="photo-btn move-up" title="Move up">↑</button>' : ''}
      ${index < photos.length - 1 ? '<button class="photo-btn move-down" title="Move down">↓</button>' : ''}
      <button class="photo-btn remove" title="Remove">×</button>
    </div>
    <div class="photo-caption">
      <input type="text" placeholder="Caption (max 800 chars)" maxlength="800" value="${photo.caption || ''}">
    </div>
  `;

  // Event listeners
  const captionInput = div.querySelector('input');
  captionInput.addEventListener('input', (e) => {
    updatePhotoCaption(photo.id, e.target.value);
  });

  const removeBtn = div.querySelector('.remove');
  removeBtn.addEventListener('click', () => {
    removePhoto(photo.id);
  });

  const moveUpBtn = div.querySelector('.move-up');
  if (moveUpBtn) {
    moveUpBtn.addEventListener('click', () => {
      movePhotoUp(photo.id);
    });
  }

  const moveDownBtn = div.querySelector('.move-down');
  if (moveDownBtn) {
    moveDownBtn.addEventListener('click', () => {
      movePhotoDown(photo.id);
    });
  }

  return div;
}

/**
 * Initialize photo controls
 */
export function initPhotoControls() {
  const addBtn = document.getElementById('add-photo-btn');
  const fileInput = document.getElementById('photo-input');

  if (addBtn && fileInput) {
    addBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      if (e.target.files.length > 0) {
        await addPhotos(e.target.files);
        e.target.value = ''; // Reset input
      }
    });
  }

  renderPhotos();
}
