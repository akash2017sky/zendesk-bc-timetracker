/**
 * Azure Function: Create Time Entry
 * Proxy endpoint for BC time registration API
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
    const entryData = req.body;

    // Validate request body
    if (!entryData || !entryData.employeeId || !entryData.jobId) {
      context.res = {
        status: 400,
        body: {
          success: false,
          error: 'Missing required fields: employeeId, jobId'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      };
      addCorsHeaders(context, origin);
      return;
    }

    console.log('Creating time entry in Business Central...');

    // Create time entry in BC
    const result = await bcClient.createTimeEntry(entryData);

    context.res = {
      status: 201,
      body: {
        success: true,
        data: result
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };

    addCorsHeaders(context, origin);
  } catch (error) {
    console.error('Error creating time entry:', error);

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
