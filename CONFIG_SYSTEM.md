# Dynamic Configuration System

## Overview

This system centralizes all configuration (URLs, secrets, AWS settings) and provides them securely to the frontend through a Lambda endpoint.

## Architecture

```
Frontend Request → API Gateway → Config Lambda → Environment Variables → Response
                ↓
        secretsLoader.dynamic.js → window.CONFIG → Other JS files
```

## Files

### Lambda
- `lambda/config.mjs` - Lambda function that serves configuration
- `lambda/.env.example` - Template for environment variables
- `lambda/index.mjs` - Original comment Lambda (unchanged)

### Frontend
- `frontend/js/secretsLoader.dynamic.js` - Dynamic config loader
- `frontend/js/secretsLoader.js` - Static fallback config
- `frontend/js/dynamic-config-example.js` - Example of how to update existing files

## Setup

### 1. Lambda Environment Variables

Copy `lambda/.env.example` and set these environment variables in your Lambda:

```bash
# API URLs
COMMENT_API_URL=https://your-api-gateway.execute-api.us-east-1.amazonaws.com/default/comment
COMMENTS_API_URL=https://your-api-gateway.execute-api.us-east-1.amazonaws.com/default/comments

# Domain Configuration
PRODUCTION_DOMAIN=resume.lynxpardelle.com
DEV_DOMAIN_URI=http://localhost:5500/frontend/index.html
PRODUCTION_DOMAIN_URI=https://resume.lynxpardelle.com

# AWS Cognito
COGNITO_CLIENT_ID=your-client-id
COGNITO_DOMAIN=https://your-domain.auth.us-east-1.amazoncognito.com
COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_YourPool
COGNITO_USER_POOL_ID=us-east-1_YourPool
COGNITO_REGION=us-east-1

# Environment
NODE_ENV=production
```

### 2. API Gateway Setup

Create an endpoint for the config Lambda:
- Path: `/config`
- Method: `GET`
- CORS enabled for `https://resume.lynxpardelle.com`

### 3. Frontend Integration

Replace `secretsLoader.js` with `secretsLoader.dynamic.js` in your HTML:

```html
<script src="js/secretsLoader.dynamic.js"></script>
```

### 4. Update Existing JavaScript Files

Follow the pattern in `dynamic-config-example.js`:

```javascript
async function initializeYourModule() {
  const config = await window.ConfigLoader.waitForConfig();
  // Use config.API.COMMENT_URL, config.COGNITO.CLIENT_ID, etc.
}

document.addEventListener('DOMContentLoaded', initializeYourModule);
```

## Security Features

- ✅ **Origin Validation**: Only serves config to authorized domains
- ✅ **CORS Protection**: Proper CORS headers
- ✅ **Environment Separation**: Different configs for dev/prod
- ✅ **Fallback Support**: Works even if Lambda is unavailable
- ✅ **No Secrets in Code**: All sensitive data in environment variables

## API Response Format

```json
{
  "success": true,
  "config": {
    "API": {
      "COMMENT_URL": "https://...",
      "COMMENTS_URL": "https://..."
    },
    "DOMAIN": {
      "PRODUCTION": "resume.lynxpardelle.com",
      "CURRENT_URI": "https://resume.lynxpardelle.com"
    },
    "COGNITO": {
      "CLIENT_ID": "...",
      "DOMAIN": "...",
      "AUTHORITY": "..."
    },
    "COOKIES": { ... },
    "AWS": { ... },
    "ENVIRONMENT": {
      "IS_PRODUCTION": true
    }
  },
  "timestamp": "2025-07-15T...",
  "environment": "production"
}
```

## Deployment

The `buildspec.yml` now handles both Lambdas:

1. Creates `function.zip` for the comment Lambda
2. Creates `config-function.zip` for the config Lambda
3. Updates both functions during deployment

## Testing

### Local Development
- Config Lambda returns dev settings when accessed from `localhost:5500`
- Fallback config is used if Lambda is unavailable

### Production
- Config Lambda only serves to `https://resume.lynxpardelle.com`
- All sensitive values come from environment variables

## Benefits

1. **Security**: No secrets in source code
2. **Flexibility**: Easy to change configs without code changes
3. **Environment Management**: Automatic dev/prod detection
4. **Reliability**: Fallback config if Lambda fails
5. **Maintainability**: Single source of truth for all configurations
