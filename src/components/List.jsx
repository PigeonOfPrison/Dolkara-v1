import React from 'react';
import Button from './Button';

/**
 * List - Reusable list component for spawn points, exits, etc.
 * 
 * @param {Array} items - Array of items to display
 * @param {Function} renderItem - Function(item, index) to render each item
 * @param {Function} onAdd - Callback when + button clicked
 * @param {Function} onDelete - Callback(index) when delete clicked
 * @param {string} addLabel - Label for add button (default: "Add Item")
 * @param {string} emptyMessage - Message when list is empty
 */
export default function List({
  items = [],
  renderItem,
  onAdd,
  onDelete,
  addLabel = "Add Item",
  emptyMessage = "No items yet"
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Add Button */}
      {onAdd && (
        <Button
          variant="primary"
          size="small"
          onClick={onAdd}
        >
          + {addLabel}
        </Button>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <p style={{ 
          fontSize: '11px', 
          color: 'var(--color-text-muted)', 
          textAlign: 'center',
          padding: '8px'
        }}>
          {emptyMessage}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: onDelete ? '1fr 28px' : '1fr',
                gap: '6px',
                alignItems: 'center',
                padding: '6px 8px',
                border: '1px solid var(--color-border-normal)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-secondary)'
              }}
            >
              {/* Item Content */}
              <div style={{ minWidth: 0 }}>
                {renderItem(item, index)}
              </div>

              {/* Delete Button */}
              {onDelete && (
                <button
                  onClick={() => onDelete(index)}
                  style={{
                    width: '24px',
                    height: '24px',
                    padding: '0',
                    border: '1px solid var(--color-border-normal)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-danger)',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--color-danger)';
                    e.target.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--color-bg-secondary)';
                    e.target.style.color = 'var(--color-text-danger)';
                  }}
                  title="Delete"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
