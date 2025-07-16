// Example configuration file - copy to secretsLoader.js and update with your values
// This file shows the structure of all configuration needed

// API URLs
const COMMENT_API_URL = 'https://your-api-gateway-url/default/comment';
const COMMENTS_API_URL = 'https://your-api-gateway-url/default/comments';

// Domain Configuration
const PRODUCTION_DOMAIN = 'your-domain.com';
const DEV_DOMAIN_URI = 'http://localhost:5500/frontend/index.html';
const PRODUCTION_DOMAIN_URI = 'https://your-domain.com';

// AWS Cognito Configuration
const COGNITO_CLIENT_ID = 'your-cognito-client-id';
const COGNITO_DOMAIN = 'https://your-cognito-domain.auth.your-region.amazoncognito.com';
const COGNITO_AUTHORITY = 'https://cognito-idp.your-region.amazonaws.com/your-user-pool-id';
const COGNITO_USER_POOL_ID = 'your-user-pool-id';
const COGNITO_REGION = 'your-aws-region';

// Environment Detection
const IS_PRODUCTION = window.location.hostname === PRODUCTION_DOMAIN;
const CURRENT_DOMAIN_URI = IS_PRODUCTION ? PRODUCTION_DOMAIN_URI : DEV_DOMAIN_URI;

// Cookie Names
const COOKIE_NAMES = {
    ACCESS_TOKEN: 'YourAppAccess_token',
    ID_TOKEN: 'YourAppId_token',
    REFRESH_TOKEN: 'YourAppRefresh_token',
    EMAIL: 'YourAppEmail',
    USER: 'user'
};

// AWS S3 Detection Patterns
const S3_URL_PATTERNS = ['.s3-website-', '.s3.amazonaws.com'];

// Export all configuration for use in other modules
if (typeof window !== 'undefined') {
    window.CONFIG = {
        API: {
            COMMENT_URL: COMMENT_API_URL,
            COMMENTS_URL: COMMENTS_API_URL
        },
        DOMAIN: {
            PRODUCTION: PRODUCTION_DOMAIN,
            DEV_URI: DEV_DOMAIN_URI,
            PRODUCTION_URI: PRODUCTION_DOMAIN_URI,
            CURRENT_URI: CURRENT_DOMAIN_URI
        },
        COGNITO: {
            CLIENT_ID: COGNITO_CLIENT_ID,
            DOMAIN: COGNITO_DOMAIN,
            AUTHORITY: COGNITO_AUTHORITY,
            USER_POOL_ID: COGNITO_USER_POOL_ID,
            REGION: COGNITO_REGION
        },
        ENVIRONMENT: {
            IS_PRODUCTION: IS_PRODUCTION
        },
        COOKIES: COOKIE_NAMES,
        AWS: {
            S3_PATTERNS: S3_URL_PATTERNS
        }
    };
}

// Export for Node.js modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COMMENT_API_URL,
        COMMENTS_API_URL,
        PRODUCTION_DOMAIN,
        DEV_DOMAIN_URI,
        PRODUCTION_DOMAIN_URI,
        COGNITO_CLIENT_ID,
        COGNITO_DOMAIN,
        COGNITO_AUTHORITY,
        COGNITO_USER_POOL_ID,
        COGNITO_REGION,
        IS_PRODUCTION,
        CURRENT_DOMAIN_URI,
        COOKIE_NAMES,
        S3_URL_PATTERNS
    };
}
