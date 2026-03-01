import React from 'react';

/**
 * NumberInput - Controlled number input with min/max validation
 * 
 * @param {number} value - Current value
 * @param {function} onChange - Callback(newValue) when value changes
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} size - Size variant: 'small', 'medium', 'large'
 * @param {string} placeholder - Placeholder text
 */
export default function NumberInput({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  size = 'medium',
  placeholder = '',
  ...props 
}) {
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    
    if (isNaN(newValue)) {
      onChange(min);
      return;
    }
    
    // Clamp value between min and max
    const clampedValue = Math.max(min, Math.min(max, newValue));
    onChange(clampedValue);
  };

  const sizeStyles = {
    small: {
      padding: '4px 6px',
      fontSize: '11px'
    },
    medium: {
      padding: '6px 8px',
      fontSize: '12px'
    },
    large: {
      padding: '8px 12px',
      fontSize: '14px'
    }
  };

  const style = {
    ...sizeStyles[size],
    width: '100%',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border-normal)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-primary)',
    fontFamily: 'inherit'
  };

  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      placeholder={placeholder}
      style={style}
      {...props}
    />
  );
}
