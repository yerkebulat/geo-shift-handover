import './styles.css';
import { initDB, saveHandover, getAllHandovers, getHandover, deleteHandover, getRecentHandovers } from './db.js';
import { updateSwingDisplay, calculateSwingDay, formatDate, formatDateTime, estimateSwingStartDate } from './swing.js';
import { initPhotoControls, getPhotos, setPhotos, clearPhotos } from './photos.js';
import { initSignaturePad, getSignature, setSignature, clearSignature } from './signature.js';
import { generatePDF, downloadPDF, generatePDFFilename } from './pdf.js';
import { generateTextSummary, copyToClipboard } from './textExport.js';
import {
  showToast,
  initTabNavigation,
  initToggleSections,
  initDrillingIssues,
  initSafetyToggles,
  validateForm,
  setDefaultDate,
  syncGeologistName,
  formatDepthInputs,
  showLoading,
  hideLoading,
  switchTab
} from './ui.js';

let currentHandoverId = null;
let nothingNotableMode = false;

// Initialize app
async function init() {
  await initDB();

  // Set defaults
  setDefaultDate();

  // Initialize UI components
  initTabNavigation();
  initToggleSections();
  initDrillingIssues();
  initSafetyToggles();
  syncGeologistName();
  formatDepthInputs();

  // Initialize photo and signature
  initPhotoControls();
  initSignaturePad();

  // Set up event listeners
  setupEventListeners();

  // Load drafts
  refreshDrafts();
  refreshSwingPanel();

  // Set up swing calculation
  setupSwingCalculations();
}

function setupEventListeners() {
  const form = document.getElementById('handover-form');

  // Form submission (PDF export)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handlePDFExport();
  });

  // Save draft
  document.getElementById('save-draft-btn')?.addEventListener('click', async () => {
    await handleSaveDraft();
  });

  // Copy text
  document.getElementById('copy-text-btn')?.addEventListener('click', async () => {
    await handleCopyText();
  });

  // Load sample data
  document.getElementById('load-sample-btn')?.addEventListener('click', () => {
    loadSampleData();
  });

  // Nothing notable mode
  document.getElementById('nothing-notable-btn')?.addEventListener('click', () => {
    toggleNothingNotable();
  });

  // Listen for refresh events
  window.addEventListener('refresh-drafts', refreshDrafts);
  window.addEventListener('refresh-swing', refreshSwingPanel);
}

function setupSwingCalculations() {
  const swingStartDateInput = document.getElementById('swingStartDate');
  const dateInput = document.getElementById('date');
  const swingLengthInput = document.getElementById('swingLength');

  // Update swing display when any of these change
  const updateDisplay = () => {
    const swingStartDate = swingStartDateInput.value;
    const handoverDate = dateInput.value;
    const swingLength = parseInt(swingLengthInput.value) || 17;

    updateSwingDisplay(swingStartDate, handoverDate, swingLength);
  };

  swingStartDateInput?.addEventListener('change', updateDisplay);
  dateInput?.addEventListener('change', updateDisplay);
  swingLengthInput?.addEventListener('input', updateDisplay);

  // Auto-estimate swing start date when date is set
  dateInput?.addEventListener('change', () => {
    if (!swingStartDateInput.value && dateInput.value) {
      const estimated = estimateSwingStartDate(dateInput.value, 1, parseInt(swingLengthInput.value) || 17);
      swingStartDateInput.value = estimated;
      updateDisplay();
    }
  });

  // Initial update
  updateDisplay();
}

async function handlePDFExport() {
  const form = document.getElementById('handover-form');

  if (!validateForm(form)) {
    return;
  }

  const exportBtn = document.getElementById('export-pdf-btn');
  showLoading(exportBtn);

  try {
    const formData = collectFormData();
    const photos = getPhotos();
    const signature = getSignature();

    // Generate PDF
    const pdfBytes = await generatePDF(formData, photos, signature);
    const filename = generatePDFFilename(formData);

    // Download
    downloadPDF(pdfBytes, filename);

    // Save to database
    const handoverData = {
      ...formData,
      photos,
      signature
    };

    // Only include id if it exists (for updates)
    if (currentHandoverId) {
      handoverData.id = currentHandoverId;
    }

    const savedId = await saveHandover(handoverData);
    currentHandoverId = savedId;

    showToast('PDF exported and handover saved!', 'success');

    // Refresh swing panel
    refreshSwingPanel();

  } catch (error) {
    console.error('Error exporting PDF:', error);
    console.error('Error details:', error.message, error.stack);
    showToast(`Error exporting PDF: ${error.message || 'Please try again.'}`, 'error');
  } finally {
    hideLoading(exportBtn);
  }
}

async function handleSaveDraft() {
  const form = document.getElementById('handover-form');
  const saveBtn = document.getElementById('save-draft-btn');

  showLoading(saveBtn);

  try {
    const formData = collectFormData();
    const photos = getPhotos();
    const signature = getSignature();

    const handoverData = {
      ...formData,
      photos,
      signature
    };

    // Only include id if it exists (for updates)
    if (currentHandoverId) {
      handoverData.id = currentHandoverId;
    }

    const savedId = await saveHandover(handoverData);
    currentHandoverId = savedId;
    showToast('Draft saved successfully!', 'success');

  } catch (error) {
    console.error('Error saving draft:', error);
    showToast('Error saving draft. Please try again.', 'error');
  } finally {
    hideLoading(saveBtn);
  }
}

async function handleCopyText() {
  const form = document.getElementById('handover-form');

  if (!validateForm(form)) {
    return;
  }

  const copyBtn = document.getElementById('copy-text-btn');
  showLoading(copyBtn);

  try {
    const formData = collectFormData();
    const text = generateTextSummary(formData);

    const success = await copyToClipboard(text);

    if (success) {
      showToast('Copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy. Please try again.', 'error');
    }

  } catch (error) {
    console.error('Error copying text:', error);
    showToast('Error copying text. Please try again.', 'error');
  } finally {
    hideLoading(copyBtn);
  }
}

function collectFormData() {
  // Helper to get value safely
  const getValue = (id) => document.getElementById(id)?.value || '';

  // Collect drilling issues
  const drillingIssues = [];
  const issueTypes = [
    { id: 'issuePoorRecovery', type: 'Poor Recovery', noteId: 'notePoorRecovery' },
    { id: 'issueDeviation', type: 'Deviation Increasing', noteId: 'noteDeviation' },
    { id: 'issueSlowPenetration', type: 'Slow Penetration', noteId: 'noteSlowPenetration' },
    { id: 'issueEquipment', type: 'Equipment Issue', noteId: 'noteEquipment' },
    { id: 'issueWaterLoss', type: 'Water Loss / Circulation Issue', noteId: 'noteWaterLoss' },
    { id: 'issueOther', type: 'Other', noteId: 'noteOther' }
  ];

  issueTypes.forEach(issue => {
    const checkbox = document.getElementById(issue.id);
    if (checkbox?.checked) {
      const noteEl = document.querySelector(`#${issue.noteId} input`);
      drillingIssues.push({
        type: issue.type,
        note: noteEl?.value || ''
      });
    }
  });

  return {
    // Header
    project: getValue('project'),
    holeId: getValue('holeId'),
    drillType: getValue('drillType'),
    shift: getValue('shift'),
    date: getValue('date'),
    geologist: getValue('geologist'),
    rigContractor: getValue('rigContractor'),

    // Swing
    swingStartDate: getValue('swingStartDate'),
    swingLength: parseInt(getValue('swingLength')) || 17,
    outgoingGeologist: getValue('outgoingGeologist'),
    incomingGeologist: getValue('incomingGeologist'),

    // Depths
    startDepth: parseFloat(getValue('startDepth')),
    endDepth: parseFloat(getValue('endDepth')),
    currentBitDepth: getValue('currentBitDepth') ? parseFloat(getValue('currentBitDepth')) : null,
    progressNotes: getValue('progressNotes'),

    // Ground conditions
    groundCondition: getValue('groundCondition'),
    intervalFrom: getValue('intervalFrom') ? parseFloat(getValue('intervalFrom')) : null,
    intervalTo: getValue('intervalTo') ? parseFloat(getValue('intervalTo')) : null,
    recoveryConcern: getValue('recoveryConcern'),
    groundNotes: getValue('groundNotes'),

    // Geological observations
    lithologyChange: getValue('lithologyChange'),
    alterationChange: getValue('alterationChange'),
    mineralizationObserved: getValue('mineralizationObserved'),
    structureFaulting: getValue('structureFaulting'),

    // Drilling issues
    drillingIssues,

    // Safety
    safetyGroundStability: getValue('safetyGroundStability'),
    safetyGroundStabilityNote: getValue('safetyGroundStabilityNote'),
    safetyHoleCondition: getValue('safetyHoleCondition'),
    safetyHoleConditionNote: getValue('safetyHoleConditionNote'),
    safetyPadCondition: getValue('safetyPadCondition'),
    safetyPadConditionNote: getValue('safetyPadConditionNote'),

    // Instructions
    instruction1: getValue('instruction1'),
    instruction2: getValue('instruction2'),
    instruction3: getValue('instruction3'),

    // Signature
    signedBy: getValue('signedBy')
  };
}

function loadFormData(data) {
  // Helper to set value safely
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  };

  // Set basic fields
  setValue('project', data.project);
  setValue('holeId', data.holeId);
  setValue('drillType', data.drillType);
  setValue('shift', data.shift);
  setValue('date', data.date);
  setValue('geologist', data.geologist);
  setValue('rigContractor', data.rigContractor);

  // Swing
  setValue('swingStartDate', data.swingStartDate);
  setValue('swingLength', data.swingLength);
  setValue('outgoingGeologist', data.outgoingGeologist);
  setValue('incomingGeologist', data.incomingGeologist);

  // Depths
  setValue('startDepth', data.startDepth);
  setValue('endDepth', data.endDepth);
  setValue('currentBitDepth', data.currentBitDepth);
  setValue('progressNotes', data.progressNotes);

  // Ground conditions
  setValue('groundCondition', data.groundCondition);
  setValue('intervalFrom', data.intervalFrom);
  setValue('intervalTo', data.intervalTo);
  setValue('recoveryConcern', data.recoveryConcern);
  setValue('groundNotes', data.groundNotes);

  // Geological observations
  setValue('lithologyChange', data.lithologyChange);
  setValue('alterationChange', data.alterationChange);
  setValue('mineralizationObserved', data.mineralizationObserved);
  setValue('structureFaulting', data.structureFaulting);

  // Toggle sections based on content
  ['Lithology', 'Alteration', 'Mineralization', 'Structure'].forEach(section => {
    const checkbox = document.getElementById(`toggle${section}`);
    const content = document.getElementById(`${section.toLowerCase()}Content`);
    const fieldName = section === 'Lithology' ? 'lithologyChange' :
                      section === 'Alteration' ? 'alterationChange' :
                      section === 'Mineralization' ? 'mineralizationObserved' :
                      'structureFaulting';

    if (data[fieldName]) {
      if (checkbox) checkbox.checked = true;
      if (content) content.classList.add('active');
    }
  });

  // Drilling issues
  if (data.drillingIssues && data.drillingIssues.length > 0) {
    const issueMap = {
      'Poor Recovery': { id: 'issuePoorRecovery', noteId: 'notePoorRecovery' },
      'Deviation Increasing': { id: 'issueDeviation', noteId: 'noteDeviation' },
      'Slow Penetration': { id: 'issueSlowPenetration', noteId: 'noteSlowPenetration' },
      'Equipment Issue': { id: 'issueEquipment', noteId: 'noteEquipment' },
      'Water Loss / Circulation Issue': { id: 'issueWaterLoss', noteId: 'noteWaterLoss' },
      'Other': { id: 'issueOther', noteId: 'noteOther' }
    };

    data.drillingIssues.forEach(issue => {
      const mapping = issueMap[issue.type];
      if (mapping) {
        const checkbox = document.getElementById(mapping.id);
        const noteEl = document.querySelector(`#${mapping.noteId} input`);

        if (checkbox) {
          checkbox.checked = true;
          document.getElementById(mapping.noteId)?.classList.add('active');
        }

        if (noteEl && issue.note) {
          noteEl.value = issue.note;
        }
      }
    });
  }

  // Safety
  setValue('safetyGroundStability', data.safetyGroundStability);
  setValue('safetyGroundStabilityNote', data.safetyGroundStabilityNote);
  setValue('safetyHoleCondition', data.safetyHoleCondition);
  setValue('safetyHoleConditionNote', data.safetyHoleConditionNote);
  setValue('safetyPadCondition', data.safetyPadCondition);
  setValue('safetyPadConditionNote', data.safetyPadConditionNote);

  // Trigger safety toggles
  ['safetyGroundStability', 'safetyHoleCondition', 'safetyPadCondition'].forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.dispatchEvent(new Event('change'));
    }
  });

  // Instructions
  setValue('instruction1', data.instruction1);
  setValue('instruction2', data.instruction2);
  setValue('instruction3', data.instruction3);

  // Signature
  setValue('signedBy', data.signedBy);

  // Photos
  if (data.photos) {
    setPhotos(data.photos);
  }

  // Signature
  if (data.signature && data.signature.data) {
    setSignature(data.signature.data, data.signature.timestamp);
  }

  // Update swing display
  updateSwingDisplay(data.swingStartDate, data.date, data.swingLength);
}

function clearForm() {
  const form = document.getElementById('handover-form');
  form.reset();

  // Reset toggles
  document.querySelectorAll('.toggle-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.toggle-checkbox').forEach(el => el.checked = false);

  // Reset issues
  document.querySelectorAll('.issue-note').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.issue-checkbox').forEach(el => el.checked = false);

  // Reset safety
  document.querySelectorAll('.safety-note').forEach(el => el.classList.remove('required'));

  // Clear photos and signature
  clearPhotos();
  clearSignature();

  // Reset ID
  currentHandoverId = null;

  // Set defaults
  setDefaultDate();
  document.getElementById('swingLength').value = 17;

  // Update swing display
  updateSwingDisplay('', '', 17);
}

async function refreshDrafts() {
  const draftsContainer = document.getElementById('drafts-list');
  if (!draftsContainer) return;

  try {
    const handovers = await getAllHandovers();

    if (handovers.length === 0) {
      draftsContainer.innerHTML = '<p class="empty-state">No drafts saved yet.</p>';
      return;
    }

    draftsContainer.innerHTML = '';

    handovers.forEach(handover => {
      const card = createDraftCard(handover);
      draftsContainer.appendChild(card);
    });

  } catch (error) {
    console.error('Error loading drafts:', error);
    draftsContainer.innerHTML = '<p class="empty-state">Error loading drafts.</p>';
  }
}

function createDraftCard(handover) {
  const div = document.createElement('div');
  div.className = 'draft-card';

  const swingDay = calculateSwingDay(handover.swingStartDate, handover.date, handover.swingLength);
  const swingInfo = swingDay ? `Day ${swingDay}/${handover.swingLength}` : '';

  div.innerHTML = `
    <h3>${handover.holeId} - ${handover.shift} Shift</h3>
    <div class="draft-meta">
      <span>📅 ${formatDate(handover.date)}</span>
      <span>📏 ${handover.endDepth}m</span>
      <span>👤 ${handover.geologist}</span>
      ${swingInfo ? `<span>🔄 ${swingInfo}</span>` : ''}
    </div>
    <div class="draft-meta">
      <span>Last modified: ${formatDateTime(handover.lastModified)}</span>
    </div>
    <div class="draft-actions">
      <button class="btn-secondary load-btn">Load</button>
      <button class="btn-secondary delete-btn">Delete</button>
    </div>
  `;

  const loadBtn = div.querySelector('.load-btn');
  loadBtn.addEventListener('click', () => {
    loadDraft(handover);
  });

  const deleteBtn = div.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await deleteDraft(handover.id);
  });

  return div;
}

async function loadDraft(handover) {
  currentHandoverId = handover.id;
  loadFormData(handover);
  switchTab('form');
  showToast('Draft loaded successfully!', 'success');
  window.scrollTo(0, 0);
}

async function deleteDraft(id) {
  if (!window.confirm('Are you sure you want to delete this draft?')) {
    return;
  }

  try {
    await deleteHandover(id);
    showToast('Draft deleted successfully!', 'success');
    refreshDrafts();
    refreshSwingPanel();
  } catch (error) {
    console.error('Error deleting draft:', error);
    showToast('Error deleting draft. Please try again.', 'error');
  }
}

async function refreshSwingPanel() {
  const swingInfoContainer = document.getElementById('swing-info');
  const swingHandoversContainer = document.getElementById('swing-handovers-list');

  if (!swingInfoContainer || !swingHandoversContainer) return;

  try {
    const handovers = await getAllHandovers();

    if (handovers.length === 0) {
      swingInfoContainer.innerHTML = '<p class="empty-state">No swing data available. Create a handover first.</p>';
      swingHandoversContainer.innerHTML = '<p class="empty-state">No handovers in this swing yet.</p>';
      return;
    }

    // Get most recent handover to determine current swing
    const latest = handovers[0];
    const { swingStartDate, swingLength, date } = latest;

    if (!swingStartDate) {
      swingInfoContainer.innerHTML = '<p class="empty-state">No swing information available.</p>';
      return;
    }

    // Display swing info
    const swingDay = calculateSwingDay(swingStartDate, date, swingLength);
    const nextChangeover = formatDate(new Date(swingStartDate).setDate(new Date(swingStartDate).getDate() + swingLength - 1));

    swingInfoContainer.innerHTML = `
      <h2>Current Swing</h2>
      <div class="swing-details">
        <div class="swing-detail">
          <label>Swing Start</label>
          <div class="value">${formatDate(swingStartDate)}</div>
        </div>
        <div class="swing-detail">
          <label>Current Day</label>
          <div class="value">Day ${swingDay} of ${swingLength}</div>
        </div>
        <div class="swing-detail">
          <label>Next Changeover</label>
          <div class="value">${nextChangeover}</div>
        </div>
      </div>
    `;

    // Get recent handovers (last 7 days)
    const recentHandovers = await getRecentHandovers(7);

    if (recentHandovers.length === 0) {
      swingHandoversContainer.innerHTML = '<p class="empty-state">No handovers in the last 7 days.</p>';
      return;
    }

    swingHandoversContainer.innerHTML = '';

    recentHandovers.forEach(handover => {
      const card = createDraftCard(handover);
      swingHandoversContainer.appendChild(card);
    });

  } catch (error) {
    console.error('Error loading swing panel:', error);
  }
}

function loadSampleData() {
  const sample = {
    project: 'Gold Ridge Exploration',
    holeId: 'DDH023',
    drillType: 'DD',
    shift: 'Night',
    date: new Date().toISOString().split('T')[0],
    geologist: 'Sarah Thompson',
    rigContractor: 'ABC Drilling Co.',
    swingStartDate: estimateSwingStartDate(new Date().toISOString().split('T')[0], 1, 17),
    swingLength: 17,
    outgoingGeologist: 'Sarah Thompson',
    incomingGeologist: 'Mike Chen',
    startDepth: 125.5,
    endDepth: 142.6,
    currentBitDepth: 145.2,
    progressNotes: 'Good advance, 17.1m drilled this shift',
    groundCondition: 'Moderately broken',
    intervalFrom: 130.0,
    intervalTo: 142.6,
    recoveryConcern: 'No',
    groundNotes: 'Some fracturing observed but recovery good',
    lithologyChange: 'Transition from diorite to granodiorite at 135m. Granodiorite is medium-grained with 15% quartz.',
    alterationChange: 'Weak chlorite alteration increasing from 138m',
    mineralizationObserved: 'Trace disseminated pyrite throughout. 2-3% pyrite band at 140.5m with minor chalcopyrite',
    safetyGroundStability: 'No',
    safetyHoleCondition: 'No',
    safetyPadCondition: 'No',
    instruction1: 'Continue to 180m or EOH if unstable ground encountered',
    instruction2: 'Watch for increased water flow - reduce pump pressure if needed',
    instruction3: 'Log and photograph pyrite zone around 140m',
    signedBy: 'Sarah Thompson'
  };

  loadFormData(sample);
  showToast('Sample data loaded!', 'success');
}

function toggleNothingNotable() {
  nothingNotableMode = !nothingNotableMode;

  const btn = document.getElementById('nothing-notable-btn');

  if (nothingNotableMode) {
    btn.textContent = 'Exit Nothing Notable Mode';
    btn.style.background = '#d4a017';

    // Fill in standard text
    document.getElementById('groundCondition').value = 'Competent';
    document.getElementById('groundNotes').value = 'No issues observed';
    document.getElementById('progressNotes').value = 'Routine drilling, no issues';

    // Collapse optional sections
    document.querySelectorAll('.toggle-checkbox').forEach(cb => {
      cb.checked = false;
    });
    document.querySelectorAll('.toggle-content').forEach(content => {
      content.classList.remove('active');
    });

    showToast('Nothing Notable mode activated', 'info');
  } else {
    btn.textContent = 'Nothing Notable Mode';
    btn.style.background = '';

    showToast('Nothing Notable mode deactivated', 'info');
  }
}

// Start the app
init();
