import React from 'react';

/**
 * A small decorative streetlamp glyph used across the app (logo, empty
 * states, hero). Pure inline SVG so it themes with currentColor / CSS vars.
 */
export default function LampMark({ className = 'h-8 w-8', lit = true }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 6v6M14 44h20M24 12c-5 0-8 3.2-8 8 0 4 2.6 6 4 8.6 1 1.8 1.4 3.6 1.4 6.4h5.2c0-2.8.4-4.6 1.4-6.4 1.4-2.6 4-4.6 4-8.6 0-4.8-3-8-8-8Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="20" r="4.5" className={lit ? 'fill-glow animate-flicker' : 'fill-midnight-600'} />
    </svg>
  );
}
