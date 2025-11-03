/**
 * Azure Function: Get Employees
 * Proxy endpoint for BC employees API
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
    // Get optional email filter from query params
    const email = req.query.email || null;

    console.log('Fetching employees from Business Central...', email ? `with email: ${email}` : '');

    // Get employees from BC
    const employees = await bcClient.getEmployees(email);

    context.res = {
      status: 200,
      body: {
        success: true,
        data: employees,
        count: employees.length
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };

    addCorsHeaders(context, origin);
  } catch (error) {
    console.error('Error fetching employees:', error);

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
