import React from 'react';

/**
 * @todo Implement Button component
 * - Add variants (primary, secondary, etc.)
 * - Add sizes
 * - Add loading state
 * - Add disabled state
 * - Add icon support
 */

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  onClick
}) => {
  // TODO: Implement button styles
  // TODO: Add loading spinner
  // TODO: Add icon positioning
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}; 