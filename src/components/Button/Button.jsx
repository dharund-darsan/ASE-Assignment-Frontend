import React from 'react';
import styles from './Button.module.sass';

function Button({
  children,
  type = 'button',
  disabled,
  onClick,
  fullWidth = false,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger'
  // size = 'md',         // 'sm' | 'md' | 'lg'
  className,
  ...props
}) {
  const classes = [
    styles.button,
    styles[variant],
    // styles[size],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
