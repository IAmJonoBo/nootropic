import React from "react";
/**
 * @todo Implement Button component
 * - Add variants (primary, secondary, etc.)
 * - Add sizes
 * - Add loading state
 * - Add disabled state
 * - Add icon support
 */
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}
export declare const Button: React.FC<ButtonProps>;
export {};
