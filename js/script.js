/**
 * ArchMC JP/EN Community - Core Script (script.js)
 * Navigation, Toast Notifications, Language Selector, IP Copier
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize i18n
  if (window.i18n) {
    window.i18n.init();
  }

  // Navigation & Hamburger
  initNavigation();

  // Language Dropdown
  initLanguageDropdown();

  // Server IP Copy Button
  initCopyIp();
});

// Navigation Menu
function initNavigation() {
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');

  if (!menuBtn || !sideMenu || !overlay) return;

  function toggleMenu() {
    menuBtn.classList.toggle('open');
    sideMenu.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.classList.toggle('menu-active');
  }

  menuBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  // Close menu on nav link click in mobile
  sideMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (sideMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });
}

// Language Dropdown
function initLanguageDropdown() {
  const langDropdown = document.getElementById('langDropdown');
  const currentLangBtn = document.getElementById('currentLangBtn');
  const langMenu = document.getElementById('langMenu');

  if (!currentLangBtn || !langMenu) return;

  currentLangBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('open');
  });

  document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const code = option.getAttribute('data-lang');
      if (window.i18n && code) {
        window.i18n.setLanguage(code);
      }
      langDropdown.classList.remove('open');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (langDropdown && !langDropdown.contains(e.target)) {
      langDropdown.classList.remove('open');
    }
  });
}

// Server IP Copy
function initCopyIp() {
  const copyBtns = document.querySelectorAll('.copy-ip-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const ip = btn.getAttribute('data-ip') || 'archmc.net';
      try {
        await navigator.clipboard.writeText(ip);
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class="check-icon">✓</span> <span data-i18n="hero_ip_copied">${window.i18n ? window.i18n.getText('hero_ip_copied') : 'Copied!'}</span>`;
        btn.classList.add('copied');
        window.showToast(`${ip} をコピーしました！`, 'success', 2500);

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('copied');
          if (window.i18n) window.i18n.applyTranslations();
        }, 2200);
      } catch (err) {
        window.showToast(`IP: ${ip}`, 'info');
      }
    });
  });
}

// Toast Notifications System
window.showToast = function(message, type = 'info', duration = 4000) {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Close">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  const closeToast = () => {
    toast.classList.remove('visible');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', closeToast);

  if (duration > 0) {
    setTimeout(closeToast, duration);
  }
};

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
