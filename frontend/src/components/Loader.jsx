import React from 'react';

export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-500">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full border-2 border-midnight-600" />
        <span className="absolute inset-0 rounded-full border-2 border-t-glow border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="text-sm">{label}…</p>
    </div>
  );
}
