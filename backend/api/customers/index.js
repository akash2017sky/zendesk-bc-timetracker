/**
 * Azure Function: Get Customers
 * Proxy endpoint for BC customers API
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
    console.log('Fetching customers from Business Central...');

    // Get customers from BC
    const customers = await bcClient.getCustomers();

    context.res = {
      status: 200,
      body: {
        success: true,
        data: customers,
        count: customers.length
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };

    addCorsHeaders(context, origin);
  } catch (error) {
    console.error('Error fetching customers:', error);

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
