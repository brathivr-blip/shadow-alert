import React from 'react';

const LABELS = {
  missing: 'Missing pole/fixture',
  not_working: 'Completely dark',
  flickering: 'Flickering',
  dim: 'Too dim',
  damaged_pole: 'Damaged pole',
  daytime_burning: 'Burning in daylight',
};

export default function CategoryTag({ category }) {
  return <span className="pill bg-midnight-700 text-ink-300 border border-midnight-600">{LABELS[category] || category}</span>;
}
