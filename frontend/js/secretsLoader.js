/**
 * Dynamic Secrets Loader
 * Loads configuration from Lambda endpoint or uses fallback values
 */

// Fallback configuration - used if Lambda is not available
const FALLBACK_CONFIG = {
  API: {
    COMMENT_URL: '',
    COMMENTS_URL: ''
  },
  DOMAIN: {
    PRODUCTION: '',
    DEV_URI: '',
    PRODUCTION_URI: ''
  },
  COGNITO: {
    CLIENT_ID: '',
    DOMAIN: '',
    AUTHORITY: '',
    USER_POOL_ID: '',
    REGION: ''
  },
  COOKIES: {
    ACCESS_TOKEN: '',
    ID_TOKEN: '',
    REFRESH_TOKEN: '',
    EMAIL: '',
    USER: ''
  },
  AWS: {
    S3_PATTERNS: []
  }
};

// Configuration endpoint URL
const CONFIG_ENDPOINT_URL = 'https://nw0bgoqapb.execute-api.us-east-1.amazonaws.com/default/config';

/**
 * Loads configuration from Lambda endpoint
 * @returns {Promise<Object>} Configuration object
 */
async function loadConfigFromLambda() {
  try {
    console.log('Loading configuration from Lambda...');
    
    const response = await fetch(CONFIG_ENDPOINT_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.config) {
      console.log('Configuration loaded successfully from Lambda');
      return data.config;
    } else {
      throw new Error('Invalid response from config endpoint');
    }
    
  } catch (error) {
    console.warn('Failed to load configuration from Lambda:', error.message);
    console.log('Using fallback configuration');
    return null;
  }
}

/**
 * Initializes the global configuration
 * @returns {Promise<Object>} Final configuration object
 */
async function initializeConfig() {
  // Try to load from Lambda first
  let config = await loadConfigFromLambda();
  
  // Use fallback if Lambda failed
  if (!config) {
    config = FALLBACK_CONFIG;
  }

  // Add environment detection
  const isProduction = window.location.hostname === config.DOMAIN.PRODUCTION;
  config.ENVIRONMENT = {
    IS_PRODUCTION: isProduction
  };

  // Add computed CURRENT_URI
  config.DOMAIN.CURRENT_URI = isProduction ? 
    config.DOMAIN.PRODUCTION_URI : 
    config.DOMAIN.DEV_URI;

  // Set global CONFIG
  window.CONFIG = config;
  window.CONFIG.READY = true;

  // Dispatch custom event to notify other scripts
  window.dispatchEvent(new CustomEvent('configLoaded', { 
    detail: { config: window.CONFIG } 
  }));

  console.log('Configuration initialized:', window.CONFIG);
  return window.CONFIG;
}

/**
 * Waits for config to be ready
 * @returns {Promise<Object>} Configuration object
 */
function waitForConfig() {
  return new Promise((resolve) => {
    if (window.CONFIG && window.CONFIG.READY) {
      resolve(window.CONFIG);
    } else {
      window.addEventListener('configLoaded', (event) => {
        resolve(event.detail.config);
      }, { once: true });
    }
  });
}

// Initialize configuration when script loads
if (typeof window !== 'undefined') {
  // Initialize immediately
  initializeConfig().catch(error => {
    console.error('Failed to initialize configuration:', error);
    // Ensure fallback config is still available
    window.CONFIG = FALLBACK_CONFIG;
    window.CONFIG.READY = true;
    window.dispatchEvent(new CustomEvent('configLoaded', { 
      detail: { config: window.CONFIG } 
    }));
  });
  
  // Expose utility functions
  window.ConfigLoader = {
    waitForConfig,
    reload: initializeConfig
  };
}

// Export for Node.js modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FALLBACK_CONFIG,
    loadConfigFromLambda,
    initializeConfig,
    waitForConfig
  };
}
