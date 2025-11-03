/**
 * Zendesk Service
 * Handles all interactions with Zendesk via ZAF Client API
 */

class ZendeskService {
  constructor() {
    this.client = null;
    this.context = null;
  }

  /**
   * Initialize the service with ZAF client
   * @param {Object} client - ZAF Client instance
   */
  async initialize(client) {
    this.client = client;

    // Get initial context
    this.context = await this.client.context();

    // Resize iframe to fit content
    await this.client.invoke('resize', { width: '100%', height: '600px' });
  }

  /**
   * Get app settings from manifest parameters
   * @returns {Promise<Object>} - App settings
   */
  async getSettings() {
    try {
      const data = await this.client.metadata();
      return data.settings;
    } catch (error) {
      console.error('Failed to get app settings:', error);
      throw new Error('Failed to load app configuration');
    }
  }

  /**
   * Get current agent information
   * @returns {Promise<Object>} - Agent data including email
   */
  async getCurrentAgent() {
    try {
      const userData = await this.client.get('currentUser');
      return {
        id: userData.currentUser.id,
        email: userData.currentUser.email,
        name: userData.currentUser.name,
        role: userData.currentUser.role
      };
    } catch (error) {
      console.error('Failed to get current agent:', error);
      throw new Error('Failed to get agent information');
    }
  }

  /**
   * Get current ticket information
   * @returns {Promise<Object>} - Ticket data
   */
  async getTicket() {
    try {
      const ticketData = await this.client.get('ticket');
      return {
        id: ticketData.ticket.id,
        subject: ticketData.ticket.subject,
        status: ticketData.ticket.status,
        priority: ticketData.ticket.priority,
        organizationId: ticketData.ticket.organization?.id || null,
        tags: ticketData.ticket.tags || []
      };
    } catch (error) {
      console.error('Failed to get ticket:', error);
      throw new Error('Failed to get ticket information');
    }
  }

  /**
   * Get the URL for the current ticket
   * @returns {string} - Ticket URL
   */
  getTicketUrl() {
    if (!this.context) {
      throw new Error('Zendesk service not initialized');
    }

    const subdomain = this.context.account.subdomain;
    const ticketId = this.context.ticketId;

    return `https://${subdomain}.zendesk.com/agent/tickets/${ticketId}`;
  }

  /**
   * Get organization information for the current ticket
   * @param {number} organizationId - Organization ID
   * @returns {Promise<Object|null>} - Organization data
   */
  async getOrganization(organizationId) {
    if (!organizationId) {
      return null;
    }

    try {
      const orgData = await this.client.get(`organization.${organizationId}`);
      return orgData.organization;
    } catch (error) {
      console.error('Failed to get organization:', error);
      return null;
    }
  }

  /**
   * Show a notification to the user
   * @param {string} message - Notification message
   * @param {string} type - Notification type ('notice', 'alert', 'error')
   */
  async notify(message, type = 'notice') {
    try {
      await this.client.invoke('notify', message, type);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Resize the iframe
   * @param {number} height - New height in pixels
   */
  async resize(height) {
    try {
      await this.client.invoke('resize', { width: '100%', height: `${height}px` });
    } catch (error) {
      console.error('Failed to resize iframe:', error);
    }
  }
}

// Export singleton instance
export const zdService = new ZendeskService();
