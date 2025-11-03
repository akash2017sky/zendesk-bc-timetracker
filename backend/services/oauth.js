/**
 * OAuth 2.0 Token Service
 * Handles token acquisition and caching for Business Central API
 */

const axios = require('axios');

class OAuthService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth access token (with caching)
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log('Using cached OAuth token');
      return this.accessToken;
    }

    // Get new token
    console.log('Requesting new OAuth token from Azure AD');

    const tenantId = process.env.BC_TENANT_ID;
    const clientId = process.env.BC_CLIENT_ID;
    const clientSecret = process.env.BC_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      throw new Error('Missing OAuth configuration. Check environment variables.');
    }

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://api.businesscentral.dynamics.com/.default',
      grant_type: 'client_credentials'
    });

    try {
      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      // Cache token for duration minus 5 minutes for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000;

      console.log('OAuth token acquired successfully');
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get OAuth token:', error.response?.data || error.message);
      throw new Error(`OAuth authentication failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Clear cached token (useful for testing or forcing refresh)
   */
  clearToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}

// Export singleton instance
module.exports = new OAuthService();
