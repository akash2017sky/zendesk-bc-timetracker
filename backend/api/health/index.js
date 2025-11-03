/**
 * Azure Function: Health Check
 * Simple endpoint to verify backend is running
 */

const { addCorsHeaders, handlePreflight } = require('../../utils/cors');

module.exports = async function (context, req) {
  const origin = req.headers.origin || req.headers.referer;

  // Handle preflight
  if (req.method === 'OPTIONS') {
    handlePreflight(context, origin);
    return;
  }

  context.res = {
    status: 200,
    body: {
      success: true,
      message: 'Backend is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };

  addCorsHeaders(context, origin);
};
