import React, { useState } from 'react';
import { MAX_PALETTE_COLOURS } from '../constants/hardwareLimits';
import SelectionGrid from './SelectionGrid';
import '../css/ColourPicker.css';

/**
 * ColourPicker - Compact palette color selector with editor
 * 
 * Two modes:
 * - 'scene': Full editing mode (SceneInspector) - can edit palette colors
 * - 'select': Selection only (Tile/Entity/Collectible editors) - can only pick colors
 * 
 * @param {string} mode - 'scene' or 'select'
 * @param {string[]} palette - Array of hex colors (length = MAX_PALETTE_COLOURS)
 * @param {number} selectedIndex - Currently selected color index
 * @param {function} onColorSelect - Callback when color is selected (index)
 * @param {function} onColorChange - Callback when color is edited (index, hexColor) - only in 'scene' mode
 * @param {boolean} disabled - Disable interaction
 */
export default function ColourPicker({ 
  mode = 'select', // 'scene' or 'select'
  palette = Array(MAX_PALETTE_COLOURS).fill('#000000'),
  selectedIndex = 0,
  onColorSelect,
  onColorChange,
  disabled = false,
  className = ''
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempColor, setTempColor] = useState('#000000');
  
  const showEditor = mode === 'scene';

  // Extract RGB from hex
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const handleColorClick = (index) => {
    if (disabled) return;
    
    // Always call onColorSelect to update selection
    if (onColorSelect) {
      onColorSelect(index);
    }
    
    // In scene mode, also set editing state
    if (showEditor) {
      setEditingIndex(index);
      setTempColor(palette[index] || '#000000');
    }
  };

  const handleRgbChange = (channel, value) => {
    const rgb = hexToRgb(tempColor);
    rgb[channel] = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newColor = rgbToHex(rgb.r, rgb.g, rgb.b);
    setTempColor(newColor);
    
    if (onColorChange && editingIndex !== null) {
      onColorChange(editingIndex, newColor);
    }
  };

  const handleHexChange = (hex) => {
    // Validate hex format
    const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      setTempColor(cleanHex);
      if (onColorChange && editingIndex !== null) {
        onColorChange(editingIndex, cleanHex);
      }
    }
  };

  const currentRgb = editingIndex !== null ? hexToRgb(tempColor) : { r: 0, g: 0, b: 0 };

  // Render function for color swatches
  const renderColorSwatch = (color, index, isSelected) => {
    return (
      <div 
        className="colour-swatch-inner"
        style={{ 
          backgroundColor: color,
          width: '100%',
          height: '100%',
          borderRadius: 'var(--radius-sm)'
        }}
        title={`Color ${index}: ${color}`}
      >
        {isSelected && (
          <div className="colour-swatch-indicator" />
        )}
      </div>
    );
  };

  return (
    <div className={`colour-picker ${disabled ? 'colour-picker-disabled' : ''} ${className}`}>
      
      {/* Palette Grid using SelectionGrid */}
      <SelectionGrid
        items={palette.slice(0, MAX_PALETTE_COLOURS)}
        selectedIndex={selectedIndex}
        onSelect={handleColorClick}
        renderItem={renderColorSwatch}
        columns={4}
        itemSize={36}
        gap={4}
        disabled={disabled}
        className="colour-picker-palette"
      />

      {/* RGB Editor - Only show if showEditor is true and a color is being edited */}
      {showEditor && editingIndex !== null && (
        <div className="colour-editor">
          <div className="colour-editor-header">
            <span className="colour-editor-title">Edit Color {editingIndex}</span>
            <div 
              className="colour-editor-preview" 
              style={{ backgroundColor: tempColor }}
              title={tempColor}
            />
          </div>

          {/* RGB Sliders */}
          <div className="colour-editor-channels">
            {/* Red */}
            <div className="colour-channel">
              <label>R</label>
              <input
                type="range"
                min="0"
                max="255"
                value={currentRgb.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                className="colour-slider colour-slider-red"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={currentRgb.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                className="colour-value"
              />
            </div>

            {/* Green */}
            <div className="colour-channel">
              <label>G</label>
              <input
                type="range"
                min="0"
                max="255"
                value={currentRgb.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                className="colour-slider colour-slider-green"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={currentRgb.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                className="colour-value"
              />
            </div>

            {/* Blue */}
            <div className="colour-channel">
              <label>B</label>
              <input
                type="range"
                min="0"
                max="255"
                value={currentRgb.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                className="colour-slider colour-slider-blue"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={currentRgb.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                className="colour-value"
              />
            </div>
          </div>

          {/* Hex Input */}
          <div className="colour-hex">
            <label>Hex</label>
            <input
              type="text"
              value={tempColor}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#000000"
              maxLength={7}
              className="colour-hex-input"
            />
          </div>
        </div>
      )}
    </div>
  );
}
