/**
 * Business Central API Client
 * Makes authenticated requests to BC API using OAuth tokens
 */

const axios = require('axios');
const oauthService = require('./oauth');

class BusinessCentralClient {
  constructor() {
    this.baseUrl = null;
  }

  /**
   * Initialize the BC API base URL
   */
  getBaseUrl() {
    if (!this.baseUrl) {
      const tenantId = process.env.BC_TENANT_ID;
      const environment = process.env.BC_ENVIRONMENT || 'production';
      const companyId = process.env.BC_COMPANY_ID;

      if (!tenantId || !companyId) {
        throw new Error('Missing BC configuration. Check environment variables.');
      }

      this.baseUrl = `https://api.businesscentral.dynamics.com/v2.0/${tenantId}/${environment}/api/v2.0/companies(${companyId})`;
    }

    return this.baseUrl;
  }

  /**
   * Make authenticated request to BC API
   * @param {string} endpoint - API endpoint path
   * @param {string} method - HTTP method
   * @param {object} data - Request body (for POST/PUT)
   * @returns {Promise<object>} API response data
   */
  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      // Get OAuth token
      const accessToken = await oauthService.getAccessToken();

      // Build full URL
      const url = `${this.getBaseUrl()}${endpoint}`;

      // Make request
      const config = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      console.log(`BC API Request: ${method} ${endpoint}`);
      const response = await axios(config);

      return response.data;
    } catch (error) {
      console.error('BC API request failed:', {
        endpoint,
        status: error.response?.status,
        error: error.response?.data || error.message
      });

      // Rethrow with more context
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.data?.error?.message || error.message;

      const err = new Error(`BC API Error: ${errorMessage}`);
      err.statusCode = statusCode;
      err.details = error.response?.data;
      throw err;
    }
  }

  /**
   * Get all customers
   * @returns {Promise<Array>} List of customers
   */
  async getCustomers() {
    const data = await this.makeRequest('/customers');
    return data.value || [];
  }

  /**
   * Get all jobs/projects
   * @param {string} customerId - Optional customer ID to filter
   * @returns {Promise<Array>} List of jobs
   */
  async getJobs(customerId = null) {
    let endpoint = '/jobs';
    if (customerId) {
      endpoint += `?$filter=billToCustomerId eq ${customerId}`;
    }
    const data = await this.makeRequest(endpoint);
    return data.value || [];
  }

  /**
   * Get employees (with optional email filter)
   * @param {string} email - Optional email to filter
   * @returns {Promise<Array>} List of employees
   */
  async getEmployees(email = null) {
    let endpoint = '/employees';
    if (email) {
      endpoint += `?$filter=email eq '${email}'`;
    }
    const data = await this.makeRequest(endpoint);
    return data.value || [];
  }

  /**
   * Create time registration entry
   * @param {object} entryData - Time entry data
   * @returns {Promise<object>} Created entry
   */
  async createTimeEntry(entryData) {
    return await this.makeRequest('/timeRegistrationEntries', 'POST', entryData);
  }
}

// Export singleton instance
module.exports = new BusinessCentralClient();
