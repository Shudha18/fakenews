import React from 'react';

/**
 * A new, attractive SVG logo for the Synthetica application.
 * It features a modern shield containing a checkmark, symbolizing protection,
 * truth, and verification. It uses the app's core color gradient and a glow
 * effect in dark mode to match the futuristic theme.
 */
export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Synthetica Verification Logo"
  >
    <defs>
      {/* The gradient is defined in the Header component for better scoping */}
      <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Shield outline */}
    <path
      d="M24 4 L6 12 L6 28 C6 37.04 13.68 43.12 24 44 C34.32 43.12 42 37.04 42 28 L42 12 Z"
      stroke="url(#logo-gradient)"
      strokeWidth="3.5"
      fill="none"
      className="dark:filter-[url(#logo-glow)]"
    />
    {/* Checkmark inside the shield */}
    <path
      d="M16 24 L22 30 L32 18"
      stroke="url(#logo-gradient)"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="dark:filter-[url(#logo-glow)]"
    />
  </svg>
);
