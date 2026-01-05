/**
 * Calculate swing day number based on swing start date, handover date, and swing length
 * @param {string} swingStartDate - ISO date string (YYYY-MM-DD)
 * @param {string} handoverDate - ISO date string (YYYY-MM-DD)
 * @param {number} swingLength - Number of days in swing (default 17)
 * @returns {number} Swing day number (1-based)
 */
export function calculateSwingDay(swingStartDate, handoverDate, swingLength = 17) {
  if (!swingStartDate || !handoverDate) return null;

  const start = new Date(swingStartDate);
  const handover = new Date(handoverDate);

  // Calculate days difference
  const diffTime = handover - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Swing day is 1-based and wraps around if beyond swing length
  const swingDay = (diffDays % swingLength) + 1;

  return swingDay > 0 ? swingDay : swingLength + swingDay;
}

/**
 * Calculate the next changeover date
 * @param {string} swingStartDate - ISO date string (YYYY-MM-DD)
 * @param {number} swingLength - Number of days in swing (default 17)
 * @returns {string} Next changeover date as ISO string
 */
export function calculateNextChangeover(swingStartDate, swingLength = 17) {
  if (!swingStartDate) return null;

  const start = new Date(swingStartDate);
  const changeover = new Date(start);
  changeover.setDate(start.getDate() + swingLength - 1);

  return changeover.toISOString().split('T')[0];
}

/**
 * Estimate swing start date based on current date and target swing day
 * Useful for auto-populating swing start date
 * @param {string} currentDate - ISO date string (YYYY-MM-DD)
 * @param {number} targetSwingDay - Target swing day (1-based)
 * @param {number} swingLength - Number of days in swing (default 17)
 * @returns {string} Estimated swing start date as ISO string
 */
export function estimateSwingStartDate(currentDate, targetSwingDay = 1, swingLength = 17) {
  if (!currentDate) return null;

  const current = new Date(currentDate);
  const daysToSubtract = targetSwingDay - 1;

  const swingStart = new Date(current);
  swingStart.setDate(current.getDate() - daysToSubtract);

  return swingStart.toISOString().split('T')[0];
}

/**
 * Format date for display
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date (e.g., "5 Jan 2026")
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

/**
 * Format date and time for display
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date and time
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };

  const dateStr = date.toLocaleDateString('en-GB', dateOptions);
  const timeStr = date.toLocaleTimeString('en-GB', timeOptions);

  return `${dateStr} at ${timeStr}`;
}

/**
 * Update swing info display in the UI
 * @param {string} swingStartDate
 * @param {string} handoverDate
 * @param {number} swingLength
 */
export function updateSwingDisplay(swingStartDate, handoverDate, swingLength) {
  const swingDay = calculateSwingDay(swingStartDate, handoverDate, swingLength);
  const nextChangeover = calculateNextChangeover(swingStartDate, swingLength);

  // Update swing day display
  const swingDayEl = document.getElementById('swingDayDisplay');
  if (swingDayEl) {
    if (swingDay !== null) {
      swingDayEl.textContent = `Day ${swingDay} of ${swingLength}`;
      swingDayEl.classList.add('has-value');
    } else {
      swingDayEl.textContent = '-';
      swingDayEl.classList.remove('has-value');
    }
  }

  // Update next changeover display
  const changeoverEl = document.getElementById('nextChangeoverDisplay');
  if (changeoverEl) {
    if (nextChangeover) {
      changeoverEl.textContent = formatDate(nextChangeover);
      changeoverEl.classList.add('has-value');
    } else {
      changeoverEl.textContent = '-';
      changeoverEl.classList.remove('has-value');
    }
  }

  return { swingDay, nextChangeover };
}
