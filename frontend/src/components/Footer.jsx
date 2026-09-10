import React from 'react';
import LampMark from './LampMark';

export default function Footer() {
  return (
    <footer className="border-t border-midnight-700/70 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-ink-700 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <LampMark className="h-5 w-5 text-ink-700" />
          <span>Shadow Alert — AI Missing Streetlight Detection</span>
        </div>
        <p>Built for safer, better-lit streets.</p>
      </div>
    </footer>
  );
}
