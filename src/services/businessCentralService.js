/**
 * Business Central API Service
 * Handles all interactions with the Azure Functions backend
 * Backend handles OAuth authentication with Business Central
 */

class BusinessCentralService {
  constructor() {
    this.backendUrl = null;
  }

  /**
   * Initialize the service with configuration from Zendesk app settings
   * @param {Object} settings - App settings from manifest.json parameters
   */
  initialize(settings) {
    this.backendUrl = settings.backend_url;
    console.log('Business Central service initialized with backend:', this.backendUrl);
  }

  /**
   * Make a request to the backend API
   * @param {string} endpoint - API endpoint path (without /api prefix)
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - API response data
   */
  async makeRequest(endpoint, options = {}) {
    if (!this.backendUrl) {
      throw new Error('Business Central service not initialized. Call initialize() first.');
    }

    const url = `${this.backendUrl}${endpoint}`;
    const headers = {
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Backend API Error (${response.status}): ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();

      // Check if backend returned success: false
      if (data.success === false) {
        throw new Error(data.error || 'Backend request failed');
      }

      return data;
    } catch (error) {
      console.error('Backend API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all customers from Business Central
   * @returns {Promise<Array>} - List of customers
   */
  async getCustomers() {
    try {
      const response = await this.makeRequest('/bc/customers');
      return response.data || [];
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
      let endpoint = '/bc/jobs';

      // Filter by customer if provided
      if (customerId) {
        endpoint += `?customerId=${customerId}`;
      }

      const response = await this.makeRequest(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      throw new Error('Failed to load projects from Business Central');
    }
  }

  /**
   * Get job tasks for a specific job
   * Note: Currently not implemented in backend - may need to add if BC supports job tasks
   * @param {string} jobId - Job ID (GUID)
   * @returns {Promise<Array>} - List of job tasks
   */
  async getJobTasks(jobId) {
    try {
      // This endpoint may need to be added to backend if needed
      console.warn('Job tasks endpoint not yet implemented in backend');
      return [];
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
      const endpoint = `/bc/employees?email=${encodeURIComponent(email)}`;
      const response = await this.makeRequest(endpoint);

      if (response.data && response.data.length > 0) {
        return response.data[0];
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

      const endpoint = '/bc/timeEntries';
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create time entry:', error);
      throw new Error('Failed to save time entry to Business Central');
    }
  }
}

// Export singleton instance
export const bcService = new BusinessCentralService();
