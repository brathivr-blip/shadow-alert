import React from 'react';

const AI_STYLES = {
  likely_faulty: { label: 'AI: Likely faulty', classes: 'bg-alert/15 text-alert border border-alert/40' },
  likely_functional: { label: 'AI: Likely functional', classes: 'bg-signal/15 text-signal border border-signal/40' },
  inconclusive: { label: 'AI: Inconclusive', classes: 'bg-ink-700/30 text-ink-300 border border-ink-700/50' },
};

export default function AIBadge({ classification, confidence }) {
  const style = AI_STYLES[classification] || AI_STYLES.inconclusive;
  return (
    <span className={`pill ${style.classes}`} title="Automated brightness-heuristic analysis">
      {style.label}
      {typeof confidence === 'number' ? ` · ${confidence}%` : ''}
    </span>
  );
}
