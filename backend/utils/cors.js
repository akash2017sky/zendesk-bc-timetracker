/**
 * CORS Utilities
 * Handle CORS headers for Zendesk app requests
 */

/**
 * Check if origin is allowed
 * @param {string} origin - Request origin
 * @returns {boolean} True if allowed
 */
function isAllowedOrigin(origin) {
  if (!origin) return false;

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());

  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check wildcard patterns
  for (const allowed of allowedOrigins) {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(origin)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Add CORS headers to response
 * @param {object} context - Azure Functions context
 * @param {string} origin - Request origin
 */
function addCorsHeaders(context, origin) {
  if (isAllowedOrigin(origin)) {
    context.res.headers = {
      ...context.res.headers,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    };
  }
}

/**
 * Handle OPTIONS preflight request
 * @param {object} context - Azure Functions context
 * @param {string} origin - Request origin
 */
function handlePreflight(context, origin) {
  context.res = {
    status: 204,
    headers: {}
  };
  addCorsHeaders(context, origin);
}

module.exports = {
  isAllowedOrigin,
  addCorsHeaders,
  handlePreflight
};
