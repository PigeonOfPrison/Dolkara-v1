import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import '../css/Dropdown.css';

/**
 * Reusable dropdown/select component
 * @param {Object} props
 * @param {Array} props.options - Array of options [{value, label}] or simple strings
 * @param {string|number} props.value - Selected value
 * @param {Function} props.onChange - Change handler: (value) => void
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Optional label above dropdown
 * @param {'small'|'medium'} props.size - Size variant
 */
function Dropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  label,
  size = 'medium',
  ...rest
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options to {value, label} format
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Get display label for current value
  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const classNames = [
    'dropdown',
    `dropdown-${size}`,
    isOpen && 'dropdown-open',
    disabled && 'dropdown-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} ref={dropdownRef}>
      {label && <label className="dropdown-label">{label}</label>}
      
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        {...rest}
      >
        <span className={`dropdown-value ${!selectedOption ? 'dropdown-placeholder' : ''}`}>
          {displayLabel}
        </span>
        <FiChevronDown className="dropdown-icon" />
      </button>

      {isOpen && !disabled && (
        <ul className="dropdown-menu" role="listbox">
          {normalizedOptions.map((option) => (
            <li
              key={option.value}
              className={`dropdown-option ${option.value === value ? 'dropdown-option-selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
