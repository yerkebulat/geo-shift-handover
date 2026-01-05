/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info'
 */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <button class="toast-close">×</button>
  `;

  container.appendChild(toast);

  // Close button
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

/**
 * Switch between tabs
 * @param {string} tabName - Tab to switch to
 */
export function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  const activeContent = document.getElementById(`${tabName}-tab`);
  if (activeContent) {
    activeContent.classList.add('active');
  }
}

/**
 * Initialize tab navigation
 */
export function initTabNavigation() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      switchTab(tabName);

      // Refresh content when switching to certain tabs
      if (tabName === 'drafts') {
        window.dispatchEvent(new CustomEvent('refresh-drafts'));
      } else if (tabName === 'swing') {
        window.dispatchEvent(new CustomEvent('refresh-swing'));
      }
    });
  });
}

/**
 * Initialize toggle sections
 */
export function initToggleSections() {
  document.querySelectorAll('.toggle-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      // Remove 'toggle' and lowercase the first letter, then add 'Content'
      const baseName = e.target.id.replace('toggle', '');
      const contentId = baseName.charAt(0).toLowerCase() + baseName.slice(1) + 'Content';
      const content = document.getElementById(contentId);

      if (content) {
        if (e.target.checked) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      }
    });
  });
}

/**
 * Initialize drilling issues checkboxes
 */
export function initDrillingIssues() {
  document.querySelectorAll('.issue-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const noteId = 'note' + e.target.id.replace('issue', '');
      const noteEl = document.getElementById(noteId);

      if (noteEl) {
        if (e.target.checked) {
          noteEl.classList.add('active');
        } else {
          noteEl.classList.remove('active');
          const input = noteEl.querySelector('input');
          if (input) input.value = '';
        }
      }
    });
  });
}

/**
 * Initialize safety toggles
 */
export function initSafetyToggles() {
  ['safetyGroundStability', 'safetyHoleCondition', 'safetyPadCondition'].forEach(id => {
    const select = document.getElementById(id);
    const noteInput = document.getElementById(id + 'Note');

    if (select && noteInput) {
      select.addEventListener('change', () => {
        if (select.value === 'Yes') {
          noteInput.classList.add('required');
          noteInput.required = true;
        } else {
          noteInput.classList.remove('required');
          noteInput.required = false;
          noteInput.value = '';
        }
      });
    }
  });
}

/**
 * Validate form
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
export function validateForm(form) {
  // Check HTML5 validation first
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  // Custom validations
  const startDepth = parseFloat(document.getElementById('startDepth').value);
  const endDepth = parseFloat(document.getElementById('endDepth').value);

  if (endDepth <= startDepth) {
    showToast('End depth must be greater than start depth', 'error');
    return false;
  }

  // Check safety notes if concerns are marked
  const safetyChecks = [
    { select: 'safetyGroundStability', note: 'safetyGroundStabilityNote', name: 'Ground Stability' },
    { select: 'safetyHoleCondition', note: 'safetyHoleConditionNote', name: 'Hole Condition' },
    { select: 'safetyPadCondition', note: 'safetyPadConditionNote', name: 'Pad Condition' }
  ];

  for (const check of safetyChecks) {
    const selectEl = document.getElementById(check.select);
    const noteEl = document.getElementById(check.note);

    if (selectEl.value === 'Yes' && !noteEl.value.trim()) {
      showToast(`${check.name} concern requires a description`, 'error');
      noteEl.focus();
      return false;
    }
  }

  return true;
}

/**
 * Set today's date as default
 */
export function setDefaultDate() {
  const dateInput = document.getElementById('date');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

/**
 * Auto-fill geologist name in signature
 */
export function syncGeologistName() {
  const geologistInput = document.getElementById('geologist');
  const signedByInput = document.getElementById('signedBy');

  if (geologistInput && signedByInput) {
    geologistInput.addEventListener('input', () => {
      if (!signedByInput.value || signedByInput.value === geologistInput.dataset.previousValue) {
        signedByInput.value = geologistInput.value;
      }
      geologistInput.dataset.previousValue = geologistInput.value;
    });
  }
}

/**
 * Format number inputs to one decimal place
 */
export function formatDepthInputs() {
  ['startDepth', 'endDepth', 'currentBitDepth', 'intervalFrom', 'intervalTo'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('blur', () => {
        if (input.value) {
          const value = parseFloat(input.value);
          if (!isNaN(value)) {
            input.value = value.toFixed(1);
          }
        }
      });
    }
  });
}

/**
 * Show loading state
 * @param {HTMLElement} element
 */
export function showLoading(element) {
  element.classList.add('loading');
  element.disabled = true;
}

/**
 * Hide loading state
 * @param {HTMLElement} element
 */
export function hideLoading(element) {
  element.classList.remove('loading');
  element.disabled = false;
}

/**
 * Confirm action
 * @param {string} message
 * @returns {boolean}
 */
export function confirm(message) {
  return window.confirm(message);
}
