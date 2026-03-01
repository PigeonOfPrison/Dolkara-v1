import React from 'react';
import '../css/SelectionGrid.css';

/**
 * SelectionGrid - Reusable grid component for selecting items
 * Used in: TileSet, EntitySet, CollectibleSet, ColourPicker
 * 
 * @param {Array} items - Array of items to display
 * @param {number} selectedIndex - Currently selected item index
 * @param {function} onSelect - Callback(index) when item is clicked
 * @param {function} renderItem - Function(item, index, isSelected) that returns JSX for each item
 * @param {number} columns - Number of columns in grid (default: 4)
 * @param {number} itemSize - Size of each item in pixels (default: 40)
 * @param {number} gap - Gap between items in pixels (default: 4)
 * @param {boolean} disabled - Disable all interactions
 * @param {string} className - Additional CSS classes
 * @param {boolean} showHover - Show hover effects (default: true)
 * @param {boolean} highlightSelected - Highlight selected item (default: true)
 */
export default function SelectionGrid({
  items = [],
  selectedIndex = null,
  onSelect,
  renderItem,
  columns = 4,
  itemSize = 40,
  gap = 4,
  disabled = false,
  className = '',
  showHover = true,
  highlightSelected = true
}) {
  
  const handleItemClick = (index) => {
    if (disabled || !onSelect) return;
    onSelect(index);
  };

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`
  };

  const itemStyle = {
    minHeight: `${itemSize}px`,
    aspectRatio: '1'
  };

  return (
    <div 
      className={`selection-grid ${disabled ? 'selection-grid-disabled' : ''} ${className}`}
      style={gridStyle}
    >
      {items.map((item, index) => {
        const isSelected = highlightSelected && selectedIndex === index;
        
        return (
          <button
            key={index}
            type="button"
            className={`
              selection-grid-item 
              ${isSelected ? 'selection-grid-item-selected' : ''}
              ${showHover ? 'selection-grid-item-hoverable' : ''}
            `.trim()}
            style={itemStyle}
            onClick={() => handleItemClick(index)}
            disabled={disabled}
            aria-label={`Item ${index}`}
            aria-selected={isSelected}
          >
            {renderItem(item, index, isSelected)}
          </button>
        );
      })}
    </div>
  );
}
