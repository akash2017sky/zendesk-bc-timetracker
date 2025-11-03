/**
 * Utility helper functions
 */

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * @returns {string} - Today's date
 */
export function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Validate time entry value
 * @param {number|string} hours - Hours to validate
 * @returns {boolean} - True if valid
 */
export function isValidTimeEntry(hours) {
  const numHours = parseFloat(hours);
  return !isNaN(numHours) && numHours > 0 && numHours <= 24;
}

/**
 * Format customer display text
 * @param {Object} customer - Customer object from BC
 * @returns {string} - Formatted display text
 */
export function formatCustomerDisplay(customer) {
  if (!customer) return '';
  return `${customer.number} - ${customer.displayName || customer.name}`;
}

/**
 * Format job/project display text
 * @param {Object} job - Job object from BC
 * @returns {string} - Formatted display text
 */
export function formatJobDisplay(job) {
  if (!job) return '';
  return `${job.number} - ${job.displayName || job.description}`;
}

/**
 * Create description with ticket URL appended
 * @param {string} description - User's description
 * @param {string} ticketUrl - Zendesk ticket URL
 * @returns {string} - Complete description
 */
export function createDescriptionWithTicketUrl(description, ticketUrl) {
  if (!description || !ticketUrl) {
    return description || '';
  }
  return `${description.trim()} - ${ticketUrl}`;
}

/**
 * Truncate text to maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength);
}
