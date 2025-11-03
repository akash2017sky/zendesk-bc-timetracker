import React from 'react';

/**
 * ClientSelector Component
 * Dropdown for selecting Business Central customer
 */
export function ClientSelector({ customers, selectedClient, onChange, disabled }) {
  return (
    <div className="form-group">
      <label htmlFor="client-select">Client</label>
      <select
        id="client-select"
        className="form-control"
        value={selectedClient || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
      >
        <option value="">Select a client...</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.number} - {customer.displayName || customer.name}
          </option>
        ))}
      </select>
    </div>
  );
}
