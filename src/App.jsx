import React, { useState, useEffect } from 'react';
import { ClientSelector } from './components/ClientSelector';
import { ProjectSelector } from './components/ProjectSelector';
import { TimeEntry } from './components/TimeEntry';
import { SaveButton } from './components/SaveButton';
import { bcService } from './services/businessCentralService';
import { zdService } from './services/zendeskService';
import { getTodayDate, isValidTimeEntry, createDescriptionWithTicketUrl } from './utils/helpers';

/**
 * Main App Component
 * Manages the time tracking form and coordinates services
 */
export default function App({ zafClient }) {
  // State for form data
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  // State for UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // State for context data
  const [employee, setEmployee] = useState(null);
  const [ticketUrl, setTicketUrl] = useState('');

  /**
   * Initialize app on mount
   */
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Load projects when client changes
   */
  useEffect(() => {
    if (selectedClient) {
      loadProjects(selectedClient);
    } else {
      setProjects([]);
      setSelectedProject('');
    }
  }, [selectedClient]);

  /**
   * Initialize the application
   */
  async function initializeApp() {
    try {
      setLoading(true);
      setError(null);

      // Initialize Zendesk service
      await zdService.initialize(zafClient);

      // Get app settings
      const settings = await zdService.getSettings();

      // Initialize Business Central service
      bcService.initialize(settings);

      // Get current agent
      const agent = await zdService.getCurrentAgent();

      // Find employee in BC by email
      const bcEmployee = await bcService.getEmployeeByEmail(agent.email);

      if (!bcEmployee) {
        throw new Error(
          `No employee found in Business Central with email: ${agent.email}. Please contact your administrator.`
        );
      }

      setEmployee(bcEmployee);

      // Get ticket URL for linking
      const url = zdService.getTicketUrl();
      setTicketUrl(url);

      // Load customers
      await loadCustomers();

      setLoading(false);
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err.message);
      setLoading(false);
    }
  }

  /**
   * Load customers from Business Central
   */
  async function loadCustomers() {
    try {
      const customerList = await bcService.getCustomers();
      setCustomers(customerList);

      // TODO: Implement auto-selection logic based on ticket organization
      // For now, we'll let the user select manually
    } catch (err) {
      console.error('Failed to load customers:', err);
      throw err;
    }
  }

  /**
   * Load projects for selected client
   */
  async function loadProjects(clientId) {
    try {
      const projectList = await bcService.getJobs(clientId);
      setProjects(projectList);
      setSelectedProject(''); // Reset project selection
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects. Please try again.');
    }
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!selectedClient || !selectedProject || !hours || !description) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isValidTimeEntry(hours)) {
      setError('Please enter a valid time between 0 and 24 hours.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      // Get selected project details
      const project = projects.find((p) => p.id === selectedProject);

      if (!project) {
        throw new Error('Selected project not found.');
      }

      // Create description with ticket link
      const fullDescription = createDescriptionWithTicketUrl(description, ticketUrl);

      // Prepare time entry data
      const entryData = {
        employeeId: employee.id,
        jobId: project.id,
        jobNumber: project.number,
        jobTaskNumber: '', // Optional: could be added as future enhancement
        date: getTodayDate(),
        quantity: parseFloat(hours),
        description: fullDescription
      };

      // Create time entry in BC
      await bcService.createTimeEntry(entryData);

      // Show success message
      setMessage('Time entry saved successfully to Business Central!');
      await zdService.notify('Time entry saved successfully!', 'notice');

      // Clear form
      resetForm();

      setSaving(false);
    } catch (err) {
      console.error('Failed to save time entry:', err);
      setError(err.message || 'Failed to save time entry. Please try again.');
      await zdService.notify('Failed to save time entry.', 'error');
      setSaving(false);
    }
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    setSelectedProject('');
    setHours('');
    setDescription('');
    // Keep client selection for convenience
  }

  /**
   * Check if form is valid for submission
   */
  function isFormValid() {
    return (
      selectedClient &&
      selectedProject &&
      hours &&
      description &&
      isValidTimeEntry(hours) &&
      !saving
    );
  }

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <span className="spinner"></span>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error && !employee) {
    return (
      <div className="app-container">
        <div className="error-state">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  /**
   * Render main form
   */
  return (
    <div className="app-container">
      <div className="app-header">
        <h2>Time Tracker</h2>
        <p className="subtitle">Log time to Business Central</p>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="time-entry-form">
        <ClientSelector
          customers={customers}
          selectedClient={selectedClient}
          onChange={setSelectedClient}
          disabled={saving}
        />

        <ProjectSelector
          projects={projects}
          selectedProject={selectedProject}
          onChange={setSelectedProject}
          disabled={saving || !selectedClient}
        />

        <TimeEntry
          hours={hours}
          description={description}
          onHoursChange={setHours}
          onDescriptionChange={setDescription}
          disabled={saving}
        />

        <SaveButton
          onClick={handleSubmit}
          disabled={!isFormValid()}
          loading={saving}
        />
      </form>

      <div className="app-footer">
        <small>Logged in as: {employee?.email}</small>
      </div>
    </div>
  );
}
