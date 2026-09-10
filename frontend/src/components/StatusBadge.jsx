import React from 'react';

const STATUS_STYLES = {
  pending: { label: 'Pending review', classes: 'bg-ink-700/30 text-ink-300 border border-ink-700/50' },
  verified: { label: 'Verified', classes: 'bg-glow/15 text-glow border border-glow/40' },
  in_progress: { label: 'In progress', classes: 'bg-sky-500/15 text-sky-300 border border-sky-500/40' },
  resolved: { label: 'Resolved', classes: 'bg-signal/15 text-signal border border-signal/40' },
  rejected: { label: 'Rejected', classes: 'bg-alert/15 text-alert border border-alert/40' },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return <span className={`pill ${style.classes}`}>{style.label}</span>;
}
