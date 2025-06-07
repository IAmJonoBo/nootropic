import React from "react";
export const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
}) => {
  // TODO: Implement button styles
  // TODO: Add loading spinner
  // TODO: Add icon positioning
  return (
    <button onClick={onClick} disabled={disabled || loading}>
      {loading ? "Loading..." : children}
    </button>
  );
};
//# sourceMappingURL=Button.js.map
