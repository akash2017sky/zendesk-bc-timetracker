/**
 * Business Central API Service
 * Handles all interactions with Microsoft Dynamics 365 Business Central API
 * Uses Basic Authentication with Web Service Access Key
 */

class BusinessCentralService {
  constructor() {
    this.config = null;
    this.baseUrl = null;
    this.authHeader = null;
  }

  /**
   * Initialize the service with configuration from Zendesk app settings
   * @param {Object} settings - App settings from manifest.json parameters
   */
  initialize(settings) {
    this.config = {
      tenantId: settings.bc_tenant_id,
      environment: settings.bc_environment,
      companyId: settings.bc_company_id,
      apiEndpoint: settings.bc_api_endpoint,
      username: settings.bc_username,
      webServiceKey: settings.bc_web_service_key
    };

    // Construct base URL for API calls
    this.baseUrl = `${this.config.apiEndpoint}/${this.config.tenantId}/${this.config.environment}/api/v2.0/companies(${this.config.companyId})`;

    // Create Basic Auth header
    const credentials = btoa(`${this.config.username}:${this.config.webServiceKey}`);
    this.authHeader = `Basic ${credentials}`;
  }

  /**
   * Make an authenticated request to Business Central API
   * @param {string} endpoint - API endpoint path
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - API response data
   */
  async makeRequest(endpoint, options = {}) {
    if (!this.config) {
      throw new Error('Business Central service not initialized. Call initialize() first.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BC API Error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Business Central API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all customers from Business Central
   * @returns {Promise<Array>} - List of customers
   */
  async getCustomers() {
    try {
      const data = await this.makeRequest('/customers');
      return data.value || [];
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw new Error('Failed to load customers from Business Central');
    }
  }

  /**
   * Get all jobs/projects from Business Central
   * @param {string} customerId - Optional customer ID to filter jobs
   * @returns {Promise<Array>} - List of jobs
   */
  async getJobs(customerId = null) {
    try {
      let endpoint = '/jobs';

      // Filter by customer if provided
      if (customerId) {
        endpoint += `?$filter=billToCustomerId eq ${customerId}`;
      }

      const data = await this.makeRequest(endpoint);
      return data.value || [];
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      throw new Error('Failed to load projects from Business Central');
    }
  }

  /**
   * Get job tasks for a specific job
   * @param {string} jobId - Job ID (GUID)
   * @returns {Promise<Array>} - List of job tasks
   */
  async getJobTasks(jobId) {
    try {
      const endpoint = `/jobs(${jobId})/jobTasks`;
      const data = await this.makeRequest(endpoint);
      return data.value || [];
    } catch (error) {
      console.error('Failed to fetch job tasks:', error);
      throw new Error('Failed to load job tasks from Business Central');
    }
  }

  /**
   * Find employee by email address
   * @param {string} email - Employee email address
   * @returns {Promise<Object|null>} - Employee object or null if not found
   */
  async getEmployeeByEmail(email) {
    try {
      const endpoint = `/employees?$filter=email eq '${email}'`;
      const data = await this.makeRequest(endpoint);

      if (data.value && data.value.length > 0) {
        return data.value[0];
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch employee:', error);
      throw new Error('Failed to find employee in Business Central');
    }
  }

  /**
   * Create a time registration entry in Business Central
   * @param {Object} entryData - Time entry data
   * @param {string} entryData.employeeId - Employee GUID
   * @param {string} entryData.jobId - Job GUID
   * @param {string} entryData.jobNumber - Job number
   * @param {string} entryData.jobTaskNumber - Job task number (optional)
   * @param {string} entryData.date - Entry date (ISO format)
   * @param {number} entryData.quantity - Time quantity in hours
   * @param {string} entryData.description - Work description
   * @returns {Promise<Object>} - Created time entry
   */
  async createTimeEntry(entryData) {
    try {
      const payload = {
        employeeId: entryData.employeeId,
        jobId: entryData.jobId,
        jobNumber: entryData.jobNumber,
        jobTaskNumber: entryData.jobTaskNumber || '',
        date: entryData.date,
        quantity: entryData.quantity,
        unitOfMeasureCode: 'HOUR',
        description: entryData.description
      };

      const endpoint = '/timeRegistrationEntries';
      const data = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      return data;
    } catch (error) {
      console.error('Failed to create time entry:', error);
      throw new Error('Failed to save time entry to Business Central');
    }
  }
}

// Export singleton instance
export const bcService = new BusinessCentralService();
