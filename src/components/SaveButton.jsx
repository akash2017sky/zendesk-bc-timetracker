import React from 'react';

/**
 * SaveButton Component
 * Submit button with loading state
 */
export function SaveButton({ onClick, disabled, loading }) {
  return (
    <button
      type="submit"
      className="btn btn-primary"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="spinner"></span> Saving...
        </>
      ) : (
        'Save Time Entry'
      )}
    </button>
  );
}
