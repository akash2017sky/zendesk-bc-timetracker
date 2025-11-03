/**
 * Azure Function: Get Jobs
 * Proxy endpoint for BC jobs/projects API
 */

const bcClient = require('../../services/bcClient');
const { addCorsHeaders, handlePreflight } = require('../../utils/cors');

module.exports = async function (context, req) {
  const origin = req.headers.origin || req.headers.referer;

  // Handle preflight
  if (req.method === 'OPTIONS') {
    handlePreflight(context, origin);
    return;
  }

  try {
    // Get optional customer ID filter from query params
    const customerId = req.query.customerId || null;

    console.log('Fetching jobs from Business Central...', customerId ? `for customer: ${customerId}` : '');

    // Get jobs from BC
    const jobs = await bcClient.getJobs(customerId);

    context.res = {
      status: 200,
      body: {
        success: true,
        data: jobs,
        count: jobs.length
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };

    addCorsHeaders(context, origin);
  } catch (error) {
    console.error('Error fetching jobs:', error);

    context.res = {
      status: error.statusCode || 500,
      body: {
        success: false,
        error: error.message,
        details: error.details
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };

    addCorsHeaders(context, origin);
  }
};
