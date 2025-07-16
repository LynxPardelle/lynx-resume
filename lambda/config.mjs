/**
 * AWS Lambda function to serve configuration secrets to the frontend
 * Only serves configs to authorized origins
 */

export const handler = async (event) => {
  console.log('Config Lambda - event:', event);
  console.log('Config Lambda - event.headers:', event.headers);
  
  // CORS headers - only allow the production domain
  const allowedOrigins = [
    'https://resume.lynxpardelle.com',
    'http://localhost:5500' // Only for development
  ];
  
  const headers = {
    'Access-Control-Allow-Origin': 'https://resume.lynxpardelle.com',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  const method = event.httpMethod || event.method || event.requestContext?.http?.method;
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Check for allowed origin
  const origin = event.headers?.origin || event.headers?.Origin;
  if (!origin || !allowedOrigins.includes(origin)) {
    console.log('Forbidden origin:', origin);
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Forbidden origin' })
    };
  }

  // Update CORS header to match the requesting origin (for localhost dev)
  /* if (origin === 'http://localhost:5500') {
    headers['Access-Control-Allow-Origin'] = 'http://localhost:5500';
  } */

  // Only allow GET requests
  if (method !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check if there are all the environment variables set
    if (!process.env.COMMENT_API_URL || !process.env.COMMENTS_API_URL ||
        !process.env.PRODUCTION_DOMAIN || !process.env.DEV_DOMAIN_URI ||
        !process.env.PRODUCTION_DOMAIN_URI || !process.env.COGNITO_CLIENT_ID ||
        !process.env.COGNITO_DOMAIN || !process.env.COGNITO_AUTHORITY ||
        !process.env.COGNITO_USER_POOL_ID || !process.env.COGNITO_REGION ||
        !process.env.COOKIE_ACCESS_TOKEN || !process.env.COOKIE_ID_TOKEN ||
        !process.env.COOKIE_REFRESH_TOKEN || !process.env.COOKIE_EMAIL ||
        !process.env.COOKIE_USER || !process.env.S3_PATTERNS || !process.env.NODE_ENV) {
      throw new Error('Missing required environment variables');
    }

    // Build configuration object from environment variables
    const config = {
      API: {
        COMMENT_URL: process.env.COMMENT_API_URL,
        COMMENTS_URL: process.env.COMMENTS_API_URL
      },
      DOMAIN: {
        PRODUCTION: process.env.PRODUCTION_DOMAIN,
        DEV_URI: process.env.DEV_DOMAIN_URI,
        PRODUCTION_URI: process.env.PRODUCTION_DOMAIN_URI 
      },
      COGNITO: {
        CLIENT_ID: process.env.COGNITO_CLIENT_ID,
        DOMAIN: process.env.COGNITO_DOMAIN,
        AUTHORITY: process.env.COGNITO_AUTHORITY,
        USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
        REGION: process.env.COGNITO_REGION
      },
      COOKIES: {
        ACCESS_TOKEN: process.env.COOKIE_ACCESS_TOKEN,
        ID_TOKEN: process.env.COOKIE_ID_TOKEN,
        REFRESH_TOKEN: process.env.COOKIE_REFRESH_TOKEN,
        EMAIL: process.env.COOKIE_EMAIL,
        USER: process.env.COOKIE_USER
      },
      AWS: {
        S3_PATTERNS: process.env.S3_PATTERNS ? 
          process.env.S3_PATTERNS.split(',').map(p => p.trim()) : 
          []
      },
      ENVIRONMENT: {
        IS_PRODUCTION: process.env.NODE_ENV === 'production'
      }
    };

    // Add computed CURRENT_URI based on production flag
    config.DOMAIN.CURRENT_URI = config.ENVIRONMENT.IS_PRODUCTION ? 
      config.DOMAIN.PRODUCTION_URI : 
      config.DOMAIN.DEV_URI;

    console.log('Config Lambda - sending configuration to:', origin);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        config: config,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      })
    };

  } catch (error) {
    console.error('Config Lambda - Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: 'Failed to load configuration'
      })
    };
  }
};
