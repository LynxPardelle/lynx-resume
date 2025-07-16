/**
 * Error Page Script
 * Handles dynamic home URL detection and error tracking
 */

/**
 * Function to get the home URL dynamically based on current environment
 * @returns {string} - The appropriate home URL
 */
const getHomeUrl = async () => {
  try {
    const currentUrl = window.location.href;
    const urlParts = currentUrl.split('/');
    
    // Get S3 patterns from configuration
    const s3Patterns = (await window.ConfigLoader.waitForConfig()).AWS?.S3_PATTERNS || undefined;
    
    // Check if we're on S3 static website hosting
    const isS3 = s3Patterns?.some(pattern => currentUrl.includes(pattern));
    if (isS3) {
      // For S3 static website hosting, return the base URL
      const protocol = urlParts[0]; // http: or https:
      const domain = urlParts[2]; // domain part
      return `${protocol}//${domain}/`;
    }
    
    // For other environments, try to detect the base URL
    if (urlParts.length > 3) {
      // If there are path segments, go up to find the root
      return `${urlParts[0]}//${urlParts[2]}/`;
    }
    
    // Fallback to current directory
    return './index.html';
  } catch (error) {
    console.error('Error getting home URL:', error);
    return './index.html';
  }
};

/**
 * Function to set up home links with the correct URL
 */
const setupHomeLinks = () => {
  const homeUrl = getHomeUrl();
  const homeLinks = [
    document.getElementById('home-link'),
    document.getElementById('nav-home'),
    document.getElementById('btn-home-en'),
    document.getElementById('btn-home-es')
  ];

  homeLinks.forEach(link => {
    if (link) {
      link.href = homeUrl;
    }
  });
};

/**
 * Initialize error page functionality
 */
const initializeErrorPage = () => {
  setupHomeLinks();
  
  // Additional error tracking (optional)
  console.log('404 Error Page Loaded');
  console.log('Referrer:', document.referrer);
  console.log('Current URL:', window.location.href);
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeErrorPage);

// Fallback initialization for older browsers
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeErrorPage);
} else {
  initializeErrorPage();
}
