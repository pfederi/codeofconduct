import { 
  loadSupportersFromDb, 
  saveSupporterToDb, 
  updateSupporterInDb, 
  deleteSupporterFromDb,
  getSupporterById,
  uploadLogoToStorage,
  deleteLogoFromStorage,
  getAdminCredentials,
  setAdminCredentials,
  loadPendingSupportersFromDb,
  approvePendingSupporter,
  rejectPendingSupporter,
  loadSignatoriesFromDb,
  saveSignatoryToDb,
  updateSignatoryInDb,
  deleteSignatoryFromDb
} from './db.js';
import { EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_APPROVAL, EMAILJS_TEMPLATE_NOTIFY, ADMIN_EMAIL } from './emailjs-config.js';

// Initialize EmailJS
if (window.emailjs) {
  window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  
} else {
  console.warn('EmailJS SDK not loaded');
}

async function sendApprovalEmail(supporter) {
  if (!window.emailjs) {
    console.error('EmailJS not available');
    return;
  }

  try {
    const result = await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_APPROVAL, {
      to_email: supporter.email,
      to_name: supporter.name,
      from_email: supporter.email,
      supporter_name: supporter.name,
      supporter_link: supporter.link,
      supporter_message: supporter.message || '–',
      website_url: 'https://responsible.pumpfoiling.community'
    });
  } catch (error) {
    console.error('Failed to send approval email:', error);
    showToast('E-Mail konnte nicht gesendet werden: ' + (error?.text || error?.message || error), 'error');
  }
}

async function sendNotificationEmail(name, link, email, message) {
  if (!window.emailjs || EMAILJS_TEMPLATE_NOTIFY === 'YOUR_NOTIFICATION_TEMPLATE_ID') {
    console.warn('Notification template not configured');
    return;
  }

  try {
    const result = await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_NOTIFY, {
      to_email: ADMIN_EMAIL,
      to_name: 'Patrick',
      from_name: name,
      from_email: email,
      supporter_name: name,
      supporter_link: link,
      supporter_message: message || '–',
      website_url: 'https://responsible.pumpfoiling.community/admin'
    });
    
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
}

// --- Toast & Confirm UI ---

const TOAST_ICONS = {
  success: `<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
  error: `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
  warning: `<svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  info: `<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
};

const TOAST_BORDERS = {
  success: 'border-green-400 dark:border-green-600',
  error: 'border-red-400 dark:border-red-600',
  warning: 'border-orange-400 dark:border-orange-600',
  info: 'border-blue-400 dark:border-blue-600'
};

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-start gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-l-4 ${TOAST_BORDERS[type]} rounded-lg shadow-lg toast-enter`;
  const closeBtn = '<button class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2" onclick="this.closest(\'.pointer-events-auto\').remove()"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>';
  toast.innerHTML = `<div class="flex-shrink-0 mt-0.5">${TOAST_ICONS[type]}</div><p class="text-sm text-gray-800 dark:text-gray-200 flex-1"></p>${closeBtn}`;
  toast.querySelector('p').textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

function showConfirm(title, message, type = 'warning') {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirm-dialog');
    const iconEl = document.getElementById('confirm-icon');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    titleEl.textContent = title;
    msgEl.textContent = message;

    const colors = {
      danger: { bg: 'bg-red-100 dark:bg-red-900/30', icon: TOAST_ICONS.error, btn: 'bg-red-600 hover:bg-red-700' },
      warning: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: TOAST_ICONS.warning, btn: 'bg-orange-600 hover:bg-orange-700' },
      success: { bg: 'bg-green-100 dark:bg-green-900/30', icon: TOAST_ICONS.success, btn: 'bg-green-600 hover:bg-green-700' }
    };
    const c = colors[type] || colors.warning;
    iconEl.className = `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${c.bg}`;
    iconEl.innerHTML = c.icon;
    okBtn.className = `flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-md transition-colors ${c.btn}`;

    dialog.style.display = 'flex';

    function cleanup(result) {
      dialog.style.display = 'none';
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      resolve(result);
    }
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

// Check if user is logged in
async function checkAuth() {
  const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
  if (!isAuthenticated) {
    // Show login modal instead of prompt
    showLoginModal();
    return false; // Will be set to true after successful login
  }
  return true;
}

// Show login modal
function showLoginModal() {
  const loginDialog = document.getElementById('login-dialog');
  if (loginDialog) {
    loginDialog.style.display = 'flex';
  }
}

// Handle login
window.handleLogin = async function() {
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  
  if (!usernameInput || !passwordInput) return;
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  
  if (!username || !password) {
    showToast('Bitte gib deinen Username und dein Passwort ein.', 'warning');
    return;
  }
  
  try {
    // Get credentials from Firestore
    let credentials = await getAdminCredentials();
    
    // If no credentials in DB, use default and save them
    if (!credentials || !credentials.username || !credentials.password) {
      credentials = {
        username: DEFAULT_ADMIN_USERNAME,
        password: DEFAULT_ADMIN_PASSWORD
      };
      // Save default credentials to DB
      try {
        await setAdminCredentials(credentials.username, credentials.password);
      } catch (saveError) {
        console.warn('Could not save default credentials to DB:', saveError);
      }
    }
    
    // Verify credentials
    if (username === credentials.username && password === credentials.password) {
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_username', username);
      
      // Hide login modal and show admin panel
      showAdminPanel();
      
      // Initialize admin panel
      await loadSupporters();
      await loadPendingSupporters();
      await loadSignatories();
      setupFormHandler();
      setupSignatoryFormHandler();
      setupLogoPreview();
      setupPasswordChange();
      setupSearch();
      setupSignatorySearch();
      updateUserInfo();
      
      // Initialize custom cursor (if function exists)
      if (typeof initCustomCursor === 'function') {
        initCustomCursor();
      }
      
      // Initialize scroll animations (if function exists)
      if (typeof initScrollAnimations === 'function') {
        initScrollAnimations();
      }
      
    } else {
      showToast('Falscher Username oder Passwort!', 'error');
      passwordInput.value = '';
      usernameInput.focus();
    }
  } catch (error) {
    console.error('Error checking auth:', error);
    // Fallback to default credentials if DB access fails
    if (username === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_username', username);
      showAdminPanel();
      await loadSupporters();
      await loadPendingSupporters();
      await loadSignatories();
      setupFormHandler();
      setupSignatoryFormHandler();
      setupLogoPreview();
      setupPasswordChange();
      setupSearch();
      setupSignatorySearch();
      updateUserInfo();
    } else {
      showToast('Falscher Username oder Passwort!', 'error');
      passwordInput.value = '';
    }
  }
};

// Logout function
window.logout = function() {
  sessionStorage.removeItem('admin_authenticated');
  window.location.href = './index.html';
};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
  
  if (!isAuthenticated) {
    // Show login modal
    showLoginModal();
    // Setup login form handler
    setupLoginForm();
    return;
  }
  
  // User is authenticated, show admin panel
  showAdminPanel();
  
  // Load supporters
  await loadSupporters();
  await loadPendingSupporters();
  
  // Load signatories
  await loadSignatories();
  
  // Setup form handler
  setupFormHandler();
  setupSignatoryFormHandler();
  
  // Setup logo preview
  setupLogoPreview();
  
  // Setup password change handler
  setupPasswordChange();
  
  // Setup search
  setupSearch();
  setupSignatorySearch();
  
  // Update user info
  updateUserInfo();
});

// Show admin panel
function showAdminPanel() {
  const adminPanel = document.getElementById('admin-panel');
  const loginDialog = document.getElementById('login-dialog');
  if (adminPanel) {
    adminPanel.style.display = 'block';
  }
  if (loginDialog) {
    loginDialog.style.display = 'none';
  }
}

// Close login modal
window.closeLoginModal = function() {
  const loginDialog = document.getElementById('login-dialog');
  if (loginDialog) {
    loginDialog.style.display = 'none';
  }
}

// Setup login form
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleLogin();
    });
  }
  
  // Allow Enter key to submit
  const passwordInput = document.getElementById('login-password');
  if (passwordInput) {
    passwordInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        await handleLogin();
      }
    });
  }
}

// Update user info display
function updateUserInfo() {
  const username = sessionStorage.getItem('admin_username') || 'Admin';
  const usernameDisplay = document.getElementById('username-display');
  const userIcon = document.getElementById('user-icon');
  
  if (usernameDisplay) {
    usernameDisplay.textContent = username;
  }
  
  if (userIcon) {
    userIcon.textContent = username.charAt(0).toUpperCase();
  }
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.getElementById('search-supporters');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      filterSupporters(searchTerm);
    });
  }
}

// Filter supporters by search term
function filterSupporters(searchTerm) {
  const supporterItems = document.querySelectorAll('#supporters-list > div');
  
  supporterItems.forEach(item => {
    // Skip the "become supporter" card (has border-dashed)
    if (item.classList.contains('border-dashed')) {
      return;
    }
    
    const name = item.getAttribute('data-supporter-name') || '';
    const link = item.getAttribute('data-supporter-link') || '';
    
    if (name.includes(searchTerm) || link.includes(searchTerm)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

// Load supporters from Firestore
async function loadSupporters() {
  const supportersList = document.getElementById('supporters-list');
  const supportersCount = document.getElementById('supporters-count');
  
  if (supportersList) {
    supportersList.innerHTML = '<div class="loading">Lade Unterstützer...</div>';
  }
  
  try {
    const supporters = await loadSupportersFromDb();
    
    // Update count
    if (supportersCount) {
      supportersCount.textContent = supporters.length;
    }
    
    if (supporters.length === 0) {
      if (supportersList) {
        supportersList.innerHTML = `
          <div class="col-span-full text-center py-16">
            <div class="text-6xl mb-4 opacity-50">📭</div>
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Noch keine Unterstützer</h3>
            <p class="text-gray-600 dark:text-gray-400">Klicke auf "Neuer Unterstützer" um den ersten hinzuzufügen.</p>
          </div>
        `;
      }
      return;
    }
    
    if (supportersList) {
      supportersList.innerHTML = '';
      supporters.forEach(supporter => {
        const item = createSupporterItem(supporter);
        supportersList.appendChild(item);
      });
      
      initDragAndDrop(supportersList);
    }
  } catch (error) {
    console.error('Error loading supporters:', error);
    if (supportersList) {
      supportersList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Fehler</h3><p style="color: var(--admin-danger);">Fehler beim Laden der Unterstützer.</p></div>';
    }
  }
}

// Drag & Drop reordering
function initDragAndDrop(grid) {
  let draggedEl = null;

  grid.addEventListener('dragstart', (e) => {
    const card = e.target.closest('[data-supporter-id]');
    if (!card) { e.preventDefault(); return; }
    draggedEl = card;
    card.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.supporterId);
  });

  grid.addEventListener('dragend', (e) => {
    if (draggedEl) {
      draggedEl.style.opacity = '1';
      draggedEl = null;
    }
    grid.querySelectorAll('[data-supporter-id]').forEach(el => {
      el.classList.remove('ring-2', 'ring-blue-500');
    });
  });

  grid.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('[data-supporter-id]');
    if (target && target !== draggedEl) {
      grid.querySelectorAll('[data-supporter-id]').forEach(el => {
        el.classList.remove('ring-2', 'ring-blue-500');
      });
      target.classList.add('ring-2', 'ring-blue-500');
    }
  });

  grid.addEventListener('dragleave', (e) => {
    const target = e.target.closest('[data-supporter-id]');
    if (target && !target.contains(e.relatedTarget)) {
      target.classList.remove('ring-2', 'ring-blue-500');
    }
  });

  grid.addEventListener('drop', async (e) => {
    e.preventDefault();
    const target = e.target.closest('[data-supporter-id]');
    if (!target || !draggedEl || target === draggedEl) return;

    target.classList.remove('ring-2', 'ring-blue-500');

    // Swap DOM positions
    const allCards = [...grid.querySelectorAll('[data-supporter-id]')];
    const dragIdx = allCards.indexOf(draggedEl);
    const dropIdx = allCards.indexOf(target);

    if (dragIdx < dropIdx) {
      target.after(draggedEl);
    } else {
      target.before(draggedEl);
    }

    // Persist the new order to Firestore
    await saveNewOrder(grid);
  });
}

async function saveNewOrder(grid) {
  const cards = [...grid.querySelectorAll('[data-supporter-id]')];
  const updates = cards.map((card, index) => ({
    id: card.dataset.supporterId,
    order: cards.length - index
  }));

  try {
    await Promise.all(
      updates.map(({ id, order }) => updateSupporterInDb(id, { order }))
    );
    
  } catch (error) {
    console.error('Error saving order:', error);
    showToast('Fehler beim Speichern der Reihenfolge.', 'error');
  }
}

// Create supporter card (using shadcn/ui design)
function createSupporterItem(supporter) {
  const item = document.createElement('div');
  item.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer group relative';
  item.setAttribute('data-supporter-id', supporter.id);
  item.setAttribute('draggable', 'true');
  
  // Store supporter data for filtering
  item.setAttribute('data-supporter-name', supporter.name.toLowerCase());
  item.setAttribute('data-supporter-link', supporter.link.toLowerCase());
  
  // Ensure logoPath is properly formatted
  let logoUrl = supporter.logoPath || '';
  
  // Handle different logo path formats
  if (!logoUrl || logoUrl.trim() === '') {
    // No logo path provided - don't use fallback, show placeholder instead
    console.warn('No logo path for supporter:', supporter.name);
    logoUrl = null; // Will show placeholder
  } else {
    // Trim whitespace
    logoUrl = logoUrl.trim();
    
    // Firebase Storage URLs are already complete
    if (logoUrl.includes('firebasestorage.googleapis.com') || 
        logoUrl.includes('firebasestorage') ||
        (logoUrl.startsWith('https://') && logoUrl.includes('storage'))) {
    }
    else if (logoUrl.startsWith('https://') || logoUrl.startsWith('http://')) {
    }
    else if (logoUrl.startsWith('src/') || logoUrl.startsWith('./src/')) {
    }
    else if (!logoUrl.startsWith('/')) {
      logoUrl = './' + logoUrl;
    }
  }
  
  const safeName = escHtml(supporter.name);
  const safeLink = escHtml(supporter.link);
  const safeLogo = logoUrl ? escHtml(logoUrl) : '';
  item.innerHTML = `
    <div class="p-6">
      <div class="aspect-square flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[200px] relative">
        ${safeLogo ? `
          <img src="${safeLogo}" 
               alt="${safeName}" 
               class="max-w-full max-h-full object-contain"
               onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<span style=&quot;color:#9ca3af;font-size:0.875rem&quot;>Logo nicht verfügbar</span>';"
               loading="lazy">
        ` : `
          <div class="flex items-center justify-center text-gray-400 text-sm">
            <span>Kein Logo hochgeladen</span>
          </div>
        `}
      </div>
      
      <div class="text-center">
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">${safeName}</h3>
        <a href="${safeLink}" 
           target="_blank" 
           rel="noopener noreferrer" 
           onclick="event.stopPropagation();"
           class="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-block break-all">
          ${escHtml(supporter.link.replace(/^https?:\/\//, '').replace(/\/$/, ''))}
        </a>
      </div>
      
      <!-- Drag Handle (shown on hover) -->
      <div class="drag-handle absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
           title="Ziehen zum Umsortieren">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
        </svg>
      </div>

      <!-- Actions (shown on hover) -->
      <div class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button onclick="event.stopPropagation(); editSupporter('${supporter.id}');" 
                class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm"
                title="Bearbeiten">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </button>
        <button onclick="event.stopPropagation(); deleteSupporter('${supporter.id}');" 
                class="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm"
                title="Löschen">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
  
  // Make card clickable for editing (but not when clicking buttons or links)
  item.addEventListener('click', (e) => {
    if (!e.target.closest('button') && !e.target.closest('a')) {
      editSupporter(supporter.id);
    }
  });
  
  return item;
}

// Open add modal
window.openAddModal = function() {
  const dialog = document.getElementById('supporter-dialog');
  const form = document.getElementById('supporter-form');
  const title = document.getElementById('modal-title');
  
  if (dialog && form && title) {
    title.textContent = 'Neuer Unterstützer';
    form.reset();
    document.getElementById('supporter-id').value = '';
    const preview = document.getElementById('logo-preview');
    if (preview) preview.innerHTML = '';
    dialog.style.display = 'flex';
  }
};

// Edit supporter
window.editSupporter = async function(id) {
  try {
    const supporter = await getSupporterById(id);
    const dialog = document.getElementById('supporter-dialog');
    const form = document.getElementById('supporter-form');
    const title = document.getElementById('modal-title');
    
    if (dialog && form && title) {
      title.textContent = 'Unterstützer bearbeiten';
      document.getElementById('supporter-id').value = supporter.id;
      document.getElementById('supporter-name').value = supporter.name;
      document.getElementById('supporter-link').value = supporter.link;
      
      // Show logo preview
      const preview = document.getElementById('logo-preview');
      if (preview) {
        if (supporter.logoPath && supporter.logoPath.trim() !== '') {
          preview.innerHTML = `<img src="${escHtml(supporter.logoPath)}" alt="Logo Preview" class="max-w-[200px] max-h-[200px] border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-white dark:bg-gray-800" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<span style=&quot;color:#9ca3af;font-size:0.875rem&quot;>Logo konnte nicht geladen werden</span>';">`;
        } else {
          preview.innerHTML = '';
        }
      }
      
      dialog.style.display = 'flex';
    }
  } catch (error) {
    console.error('Error loading supporter:', error);
    showToast('Fehler beim Laden des Unterstützers.', 'error');
  }
};

// Delete supporter
window.deleteSupporter = async function(id) {
  const confirmed = await showConfirm('Unterstützer löschen', 'Möchtest du diesen Unterstützer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.', 'danger');
  if (!confirmed) return;
  
  try {
    const supporter = await getSupporterById(id);
    await deleteSupporterFromDb(id);
    
    if (supporter.logoPath && supporter.logoPath.includes('firebasestorage')) {
      try {
        await deleteLogoFromStorage(supporter.logoPath);
      } catch (deleteError) {
        console.warn('Could not delete logo from Storage:', deleteError);
      }
    }
    
    await loadSupporters();
    showToast('Unterstützer wurde gelöscht.', 'success');
  } catch (error) {
    console.error('Error deleting supporter:', error);
    showToast('Fehler beim Löschen des Unterstützers: ' + error.message, 'error');
  }
};

// Close modal
window.closeModal = function() {
  const dialog = document.getElementById('supporter-dialog');
  if (dialog) {
    dialog.style.display = 'none';
  }
};

// Setup form handler
function setupFormHandler() {
  const form = document.getElementById('supporter-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    const id = formData.get('id');
    const name = formData.get('name');
    const link = formData.get('link');
    const logoFile = formData.get('logo');
    
    if (!name || !link) {
      showToast('Bitte fülle alle Pflichtfelder aus.', 'warning');
      return;
    }
    
    try {
      let logoPath = '';
      
      // Handle logo upload
      if (logoFile && logoFile.size > 0) {
        // Upload to Firebase Storage
        submitButton.disabled = true;
        submitButton.textContent = 'Logo wird hochgeladen...';
        
        try {
          logoPath = await uploadLogoToStorage(logoFile, id || null);
          submitButton.textContent = 'Wird gespeichert...';
        } catch (uploadError) {
          console.error('Error uploading logo:', uploadError);
          showToast('Fehler beim Hochladen des Logos: ' + uploadError.message, 'error');
          submitButton.disabled = false;
          submitButton.textContent = originalText;
          return;
        }
      } else if (id) {
        // Editing existing supporter - keep current logo if no new file uploaded
        const existing = await getSupporterById(id);
        logoPath = existing.logoPath || '';
      }
      
      // Validate URL format
      let finalLink = link;
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        finalLink = 'https://' + link;
      }
      
      if (id) {
        // Update existing supporter
        const updateData = {
          name,
          link: finalLink
        };
        
        // Only update logoPath if a new logo was uploaded
        if (logoPath) {
          updateData.logoPath = logoPath;
          
          // Delete old logo from Storage if it exists and is different
          const existing = await getSupporterById(id);
          if (existing.logoPath && existing.logoPath !== logoPath && existing.logoPath.includes('firebasestorage')) {
            try {
              await deleteLogoFromStorage(existing.logoPath);
            } catch (deleteError) {
              console.warn('Could not delete old logo:', deleteError);
              // Continue even if deletion fails
            }
          }
        }
        
        await updateSupporterInDb(id, updateData);
        showToast('Unterstützer wurde aktualisiert.', 'success');
      } else {
        // Create new supporter
        if (!logoPath) {
          showToast('Bitte wähle ein Logo aus.', 'warning');
          submitButton.disabled = false;
          submitButton.textContent = originalText;
          return;
        }
        
        await saveSupporterToDb(name, finalLink, logoPath);
        showToast('Unterstützer wurde hinzugefügt.', 'success');
      }
      
      // Reload supporters list
      await loadSupporters();
      
      // Close modal
      closeModal();
      
    } catch (error) {
      console.error('Error saving supporter:', error);
      showToast('Fehler beim Speichern des Unterstützers: ' + error.message, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// Setup logo preview
function setupLogoPreview() {
  const logoInput = document.getElementById('supporter-logo');
  const preview = document.getElementById('logo-preview');
  
  if (!logoInput || !preview) return;
  
  logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Logo Preview" class="max-w-[200px] max-h-[200px] border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-white dark:bg-gray-800">`;
      };
      reader.readAsDataURL(file);
    } else {
      preview.innerHTML = '';
    }
  });
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const dialog = document.getElementById('supporter-dialog');
  if (dialog && e.target === dialog) {
    closeModal();
  }
  
  const passwordDialog = document.getElementById('password-dialog');
  if (passwordDialog && e.target === passwordDialog) {
    closePasswordModal();
  }
  
  const loginDialog = document.getElementById('login-dialog');
  if (loginDialog && e.target === loginDialog) {
    closeLoginModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closePasswordModal();
  }
});

// Password Change Functions
window.openPasswordModal = function() {
  const dialog = document.getElementById('password-dialog');
  const form = document.getElementById('password-form');
  
  if (dialog && form) {
    form.reset();
    dialog.style.display = 'flex';
  }
};

window.closePasswordModal = function() {
  const dialog = document.getElementById('password-dialog');
  if (dialog) {
    dialog.style.display = 'none';
  }
};

// Setup password change handler
function setupPasswordChange() {
  const form = document.getElementById('password-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const currentPassword = formData.get('currentPassword');
    const newUsername = formData.get('newUsername')?.trim();
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (!currentPassword) {
      showToast('Bitte gib dein aktuelles Passwort ein.', 'warning');
      return;
    }

    const hasNewUsername = newUsername && newUsername.length > 0;
    const hasNewPassword = newPassword && newPassword.length > 0;

    if (!hasNewUsername && !hasNewPassword) {
      showToast('Bitte gib einen neuen Username oder ein neues Passwort ein.', 'warning');
      return;
    }

    if (hasNewPassword && newPassword.length < 6) {
      showToast('Das neue Passwort muss mindestens 6 Zeichen lang sein.', 'warning');
      return;
    }

    if (hasNewPassword && newPassword !== confirmPassword) {
      showToast('Die Passwörter stimmen nicht überein.', 'error');
      return;
    }

    try {
      const credentials = await getAdminCredentials();
      const currentUsername = credentials?.username || DEFAULT_ADMIN_USERNAME;
      const adminPassword = credentials?.password || DEFAULT_ADMIN_PASSWORD;

      if (currentPassword !== adminPassword) {
        showToast('Das aktuelle Passwort ist falsch.', 'error');
        return;
      }

      const finalUsername = hasNewUsername ? newUsername : currentUsername;
      const finalPassword = hasNewPassword ? newPassword : adminPassword;

      await setAdminCredentials(finalUsername, finalPassword);

      if (hasNewUsername) {
        sessionStorage.setItem('admin_username', finalUsername);
        updateUserInfo();
      }

      const changes = [];
      if (hasNewUsername) changes.push('Username');
      if (hasNewPassword) changes.push('Passwort');
      showToast(`${changes.join(' und ')} wurde${changes.length > 1 ? 'n' : ''} erfolgreich geändert!`, 'success');
      closePasswordModal();
      form.reset();

    } catch (error) {
      console.error('Error changing credentials:', error);
      showToast('Fehler beim Ändern der Zugangsdaten: ' + error.message, 'error');
    }
  });
}

// Close modals when clicking outside
// Already handled above in the click event listener

// --- Pending Supporters ---

async function loadPendingSupporters() {
  const pendingSection = document.getElementById('pending-section');
  const pendingList = document.getElementById('pending-list');
  const pendingCount = document.getElementById('pending-count');

  if (!pendingSection || !pendingList) return;

  try {
    const pending = await loadPendingSupportersFromDb();

    if (pending.length === 0) {
      pendingSection.style.display = 'none';
      return;
    }

    pendingSection.style.display = 'block';
    if (pendingCount) pendingCount.textContent = pending.length;

    pendingList.innerHTML = '';
    pending.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-orange-300 dark:border-orange-600 overflow-hidden relative';

      const date = item.createdAt?.toDate?.()
        ? item.createdAt.toDate().toLocaleDateString('de-CH')
        : 'Unbekannt';

      const sn = escHtml(item.name);
      const sl = escHtml(item.link);
      const se = escHtml(item.email);
      const sLogo = item.logoPath ? escHtml(item.logoPath) : '';
      card.innerHTML = `
        <div class="p-5">
          <div class="aspect-square flex items-center justify-center mb-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[160px]">
            ${sLogo
              ? `<img src="${sLogo}" alt="${sn}" class="max-w-full max-h-full object-contain" loading="lazy"
                   onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<span style=&quot;color:#9ca3af;font-size:0.875rem&quot;>Logo nicht verfügbar</span>';">`
              : `<span class="text-gray-400 text-sm">Kein Logo</span>`}
          </div>
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">${sn}</h4>
          <a href="${sl}" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all">${escHtml(item.link.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            ${se} &middot; ${escHtml(date)}
          </p>
          ${item.message ? `<p class="text-sm text-gray-600 dark:text-gray-300 mt-2 italic border-l-2 border-gray-300 dark:border-gray-600 pl-2">${escHtml(item.message)}</p>` : ''}
          <div class="flex gap-2 mt-4">
            <button onclick="handleApprove('${escHtml(item.id)}')" class="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">
              Freigeben
            </button>
            <button onclick="handleReject('${escHtml(item.id)}')" class="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
              Ablehnen
            </button>
          </div>
        </div>
      `;
      pendingList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading pending supporters:', error);
  }
}

window.handleApprove = async function(id) {
  const confirmed = await showConfirm('Unterstützer freigeben', 'Möchtest du diesen Unterstützer freigeben? Er wird auf der Website angezeigt.', 'success');
  if (!confirmed) return;
  try {
    const supporter = await getSupporterById(id);
    await approvePendingSupporter(id);

    if (supporter.email) {
      try {
        await sendApprovalEmail(supporter);
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }
    }

    showToast('Unterstützer wurde freigeschaltet!', 'success');
    await loadPendingSupporters();
    await loadSupporters();
  } catch (error) {
    console.error('Error approving supporter:', error);
    showToast('Fehler beim Freigeben: ' + error.message, 'error');
  }
};

window.handleReject = async function(id) {
  const confirmed = await showConfirm('Anfrage ablehnen', 'Möchtest du diese Unterstützeranfrage ablehnen?', 'danger');
  if (!confirmed) return;
  try {
    await rejectPendingSupporter(id);
    showToast('Anfrage wurde abgelehnt.', 'success');
    await loadPendingSupporters();
  } catch (error) {
    console.error('Error rejecting supporter:', error);
    showToast('Fehler beim Ablehnen: ' + error.message, 'error');
  }
};

// --- Tab Navigation ---

window.switchTab = function(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`panel-${tab}`).style.display = 'block';
};

// --- Signatories Management ---

let allSignatories = [];
let signatorySort = { field: 'date', dir: 'desc' };
let signatoryPage = 1;
const SIGNATORIES_PER_PAGE = 25;
let signatorySearchTerm = '';

async function loadSignatories() {
  try {
    allSignatories = await loadSignatoriesFromDb();
    
    const badge = document.getElementById('signatory-count-badge');
    if (badge) badge.textContent = allSignatories.length;
    
    renderSignatoriesTable();
  } catch (error) {
    console.error('Error loading signatories:', error);
    const tbody = document.getElementById('signatories-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-red-500">Fehler beim Laden der Unterzeichner.</td></tr>';
  }
}

function getFilteredSignatories() {
  let list = [...allSignatories];
  
  if (signatorySearchTerm) {
    const term = signatorySearchTerm.toLowerCase();
    list = list.filter(s => 
      (s.name || '').toLowerCase().includes(term) || 
      (s.location || '').toLowerCase().includes(term)
    );
  }
  
  list.sort((a, b) => {
    const dir = signatorySort.dir === 'asc' ? 1 : -1;
    if (signatorySort.field === 'date') {
      return dir * (new Date(a.date || 0) - new Date(b.date || 0));
    }
    const av = (a[signatorySort.field] || '').toLowerCase();
    const bv = (b[signatorySort.field] || '').toLowerCase();
    return dir * av.localeCompare(bv, 'de');
  });
  
  return list;
}

function renderSignatoriesTable() {
  const tbody = document.getElementById('signatories-table-body');
  const infoEl = document.getElementById('signatories-info');
  const pagesEl = document.getElementById('signatories-pages');
  if (!tbody) return;

  const filtered = getFilteredSignatories();
  const totalPages = Math.max(1, Math.ceil(filtered.length / SIGNATORIES_PER_PAGE));
  if (signatoryPage > totalPages) signatoryPage = totalPages;
  
  const start = (signatoryPage - 1) * SIGNATORIES_PER_PAGE;
  const pageItems = filtered.slice(start, start + SIGNATORIES_PER_PAGE);

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">${signatorySearchTerm ? 'Keine Treffer gefunden.' : 'Noch keine Unterzeichner vorhanden.'}</td></tr>`;
  } else {
    tbody.innerHTML = pageItems.map((sig, i) => {
      const dateStr = sig.date ? new Date(sig.date).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–';
      return `
        <tr class="text-gray-700 dark:text-gray-300">
          <td class="px-4 py-3 text-gray-400 dark:text-gray-500 tabular-nums">${start + i + 1}</td>
          <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">${escHtml(sig.name)}</td>
          <td class="px-4 py-3">${escHtml(sig.location)}</td>
          <td class="px-4 py-3 tabular-nums">${dateStr}</td>
          <td class="px-4 py-3 text-right">
            <div class="flex items-center justify-end gap-1">
              <button onclick="editSignatory('${sig.id}')" class="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Bearbeiten">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button onclick="deleteSignatory('${sig.id}')" class="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Löschen">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  if (infoEl) {
    infoEl.textContent = filtered.length === 0 
      ? 'Keine Einträge' 
      : `${start + 1}–${Math.min(start + SIGNATORIES_PER_PAGE, filtered.length)} von ${filtered.length} Unterzeichnern`;
  }

  if (pagesEl) {
    if (totalPages <= 1) {
      pagesEl.innerHTML = '';
    } else {
      let html = '';
      const btnClass = (active) => `px-3 py-1 text-sm rounded-md transition-colors ${active 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`;
      
      if (signatoryPage > 1) {
        html += `<button onclick="goToSignatoryPage(${signatoryPage - 1})" class="${btnClass(false)}">&laquo;</button>`;
      }
      
      const range = 2;
      for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || (p >= signatoryPage - range && p <= signatoryPage + range)) {
          html += `<button onclick="goToSignatoryPage(${p})" class="${btnClass(p === signatoryPage)}">${p}</button>`;
        } else if (p === signatoryPage - range - 1 || p === signatoryPage + range + 1) {
          html += `<span class="px-1 text-gray-400">…</span>`;
        }
      }
      
      if (signatoryPage < totalPages) {
        html += `<button onclick="goToSignatoryPage(${signatoryPage + 1})" class="${btnClass(false)}">&raquo;</button>`;
      }
      pagesEl.innerHTML = html;
    }
  }
}

window.goToSignatoryPage = function(page) {
  signatoryPage = page;
  renderSignatoriesTable();
};

window.sortSignatories = function(field) {
  if (signatorySort.field === field) {
    signatorySort.dir = signatorySort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    signatorySort.field = field;
    signatorySort.dir = field === 'date' ? 'desc' : 'asc';
  }
  signatoryPage = 1;
  renderSignatoriesTable();
};

window.openSignatoryModal = function(id) {
  const dialog = document.getElementById('signatory-dialog');
  const title = document.getElementById('signatory-modal-title');
  const idInput = document.getElementById('signatory-id');
  const nameInput = document.getElementById('signatory-name');
  const locationInput = document.getElementById('signatory-location');
  
  if (id) {
    const sig = allSignatories.find(s => s.id === id);
    if (!sig) return;
    title.textContent = 'Unterzeichner bearbeiten';
    idInput.value = sig.id;
    nameInput.value = sig.name || '';
    locationInput.value = sig.location || '';
  } else {
    title.textContent = 'Neuer Unterzeichner';
    idInput.value = '';
    nameInput.value = '';
    locationInput.value = '';
  }
  
  dialog.style.display = 'flex';
};

window.closeSignatoryModal = function() {
  const dialog = document.getElementById('signatory-dialog');
  if (dialog) dialog.style.display = 'none';
};

window.editSignatory = function(id) {
  openSignatoryModal(id);
};

window.deleteSignatory = async function(id) {
  const sig = allSignatories.find(s => s.id === id);
  const confirmed = await showConfirm(
    'Unterzeichner löschen',
    `Möchtest du "${sig?.name || 'diesen Unterzeichner'}" wirklich löschen?`,
    'danger'
  );
  if (!confirmed) return;
  
  try {
    await deleteSignatoryFromDb(id);
    showToast('Unterzeichner wurde gelöscht.', 'success');
    await loadSignatories();
  } catch (error) {
    console.error('Error deleting signatory:', error);
    showToast('Fehler beim Löschen: ' + error.message, 'error');
  }
};

function setupSignatoryFormHandler() {
  const form = document.getElementById('signatory-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const id = formData.get('id');
    const name = formData.get('name')?.trim();
    const location = formData.get('location')?.trim();
    
    if (!name || !location) {
      showToast('Bitte fülle alle Pflichtfelder aus.', 'warning');
      return;
    }
    
    try {
      if (id) {
        await updateSignatoryInDb(id, { name, location });
        showToast('Unterzeichner wurde aktualisiert.', 'success');
      } else {
        await saveSignatoryToDb(name, location);
        showToast('Unterzeichner wurde hinzugefügt.', 'success');
      }
      
      closeSignatoryModal();
      await loadSignatories();
    } catch (error) {
      console.error('Error saving signatory:', error);
      showToast('Fehler beim Speichern: ' + error.message, 'error');
    }
  });
}

function setupSignatorySearch() {
  const searchInput = document.getElementById('search-signatories');
  if (!searchInput) return;
  
  let debounce;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      signatorySearchTerm = e.target.value.trim();
      signatoryPage = 1;
      renderSignatoriesTable();
    }, 250);
  });
}
