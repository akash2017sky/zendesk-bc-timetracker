import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Entry point for the Zendesk app
 * Initializes ZAF client and renders React app
 */

// Wait for ZAF SDK to be ready
const client = window.ZAFClient.init();

// Render React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App zafClient={client} />
  </React.StrictMode>
);
