import React from 'react'
import '../css/PanelHeader.css'

/**
 * PanelHeader - Reusable header component for panels
 * Can display a title or tabs for multi-view panels
 * 
 * @param {string} title - Panel title (if no tabs)
 * @param {Array} tabs - Array of tab objects: [{ id, label, active }]
 * @param {Function} onTabChange - Callback when tab is clicked: (tabId) => void
 */
export default function PanelHeader({ title, tabs, onTabChange }) {
  if (tabs && tabs.length > 0) {
    // Tab mode
    return (
      <div className="panel-header panel-header-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`panel-tab ${tab.active ? 'active' : ''}`}
            onClick={() => onTabChange?.(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    )
  }

  // Title mode
  return (
    <div className="panel-header">
      {title}
    </div>
  )
}
