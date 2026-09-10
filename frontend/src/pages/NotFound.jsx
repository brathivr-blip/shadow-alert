import React from 'react';
import { Link } from 'react-router-dom';
import LampMark from '../components/LampMark';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <LampMark className="h-16 w-16 text-ink-700" lit={false} />
      <h1 className="mt-6 font-display text-3xl font-bold text-ink-100">This street isn't lit</h1>
      <p className="mt-2 text-ink-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Back to safety</Link>
    </div>
  );
}
