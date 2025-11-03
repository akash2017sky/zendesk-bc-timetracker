import React from 'react';

/**
 * TimeEntry Component
 * Input for time hours and description
 */
export function TimeEntry({ hours, description, onHoursChange, onDescriptionChange, disabled }) {
  const maxDescriptionLength = 200; // Leave room for ticket URL

  return (
    <>
      <div className="form-group">
        <label htmlFor="hours-input">Time (hours)</label>
        <input
          id="hours-input"
          type="number"
          className="form-control"
          value={hours}
          onChange={(e) => onHoursChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g., 1.5, 2.25"
          min="0.25"
          max="24"
          step="0.25"
          required
        />
        <small className="form-text">Enter time in decimal hours (e.g., 1.5 for 1h 30m)</small>
      </div>

      <div className="form-group">
        <label htmlFor="description-input">Description</label>
        <textarea
          id="description-input"
          className="form-control"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={disabled}
          placeholder="Describe the work performed..."
          rows="3"
          maxLength={maxDescriptionLength}
          required
        />
        <small className="form-text">
          {description.length}/{maxDescriptionLength} characters
        </small>
      </div>
    </>
  );
}
