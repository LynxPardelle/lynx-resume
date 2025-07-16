/**
 * Example of how to update existing JavaScript files to work with dynamic config loading
 * This shows the pattern for cognito.js, but applies to all files using CONFIG
 */

// Wait for config to be loaded before initializing
async function initializeCognito() {
    // Wait for configuration to be ready
    const config = await window.ConfigLoader.waitForConfig();

    // Rest of your cognito initialization code...
    console.log('Cognito initialized with dynamic config,', config);
}

// Initialize when DOM is ready AND config is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCognito().catch(error => {
        console.error('Failed to initialize Cognito:', error);
    });
});

/**
 * Pattern for other files:
 * 
 * 1. Wrap your initialization code in an async function
 * 2. Use await window.ConfigLoader.waitForConfig() at the beginning
 * 3. Replace hardcoded values with config properties
 * 4. Call the initialization function on DOMContentLoaded
 */