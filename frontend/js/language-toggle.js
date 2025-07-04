/**
 * Language Toggle Script
 * Handles bilingual content switching between English and Spanish
 */

let currentLang = 'en';

/**
 * Sets the display language and updates the UI accordingly
 * @param {string} lang - Language code ('en' or 'es')
 */
const setLanguage = (lang) => {      
  // Update document lang attribute for accessibility
  document.documentElement.lang = lang;

  // Hide all language sections first
  document.querySelectorAll('[lang]').forEach(el => {
    el.style.display = 'none';
  });
  
  // Show only the selected language sections
  document.querySelectorAll(`[lang="${lang}"]`).forEach(el => {
    el.style.display = 'block';
  });
  
  // Update the toggle button label
  const labelElement = document.getElementById('lang-label');
  if (labelElement) {
    labelElement.textContent = lang === 'en' ? 'ES' : 'EN';
  }
  
  // Update current language
  currentLang = lang;
};

/**
 * Toggles between English and Spanish
 */
const toggleLang = () => {
  const newLang = currentLang === 'en' ? 'es' : 'en';
  setLanguage(newLang);
};

/**
 * Initialize language when DOM is ready
 */
const initializeLanguage = () => {
  setLanguage('en');
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeLanguage);

// Fallback initialization for older browsers
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLanguage);
} else {
  initializeLanguage();
}
