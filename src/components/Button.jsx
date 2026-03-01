import '../css/Button.css';

/**
 * Reusable button component with variants and sizes
 * @param {Object} props
 * @param {'primary'|'secondary'|'danger'|'icon'} props.variant - Button style
 * @param {'small'|'medium'|'large'} props.size - Button size
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ReactNode} props.icon - Optional icon component
 * @param {React.ReactNode} props.children - Button text/content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.title - Tooltip text
 */
function Button({ 
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  icon,
  children,
  className = '',
  title,
  ...rest
}) {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    icon && !children ? 'btn-icon-only' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...rest}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
}

export default Button;