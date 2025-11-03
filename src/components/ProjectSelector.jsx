import React from 'react';

/**
 * ProjectSelector Component
 * Dropdown for selecting Business Central job/project
 */
export function ProjectSelector({ projects, selectedProject, onChange, disabled }) {
  return (
    <div className="form-group">
      <label htmlFor="project-select">Project</label>
      <select
        id="project-select"
        className="form-control"
        value={selectedProject || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
      >
        <option value="">Select a project...</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.number} - {project.displayName || project.description}
          </option>
        ))}
      </select>
    </div>
  );
}
