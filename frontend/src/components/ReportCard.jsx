import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import AIBadge from './AIBadge';
import CategoryTag from './CategoryTag';

export default function ReportCard({ report }) {
  return (
    <Link
      to={`/reports/${report._id}`}
      className="card group flex flex-col overflow-hidden transition hover:border-glow/50 hover:shadow-glow"
    >
      <div className="relative h-44 w-full overflow-hidden bg-midnight-900">
        <img
          src={report.imageUrl}
          alt={report.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <StatusBadge status={report.status} />
        </div>
        {report.priorityScore >= 70 && (
          <span className="absolute right-2 top-2 pill bg-alert text-white">High priority</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-display text-base font-semibold text-ink-100">{report.title}</h3>
        <p className="line-clamp-2 text-sm text-ink-500">{report.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          <CategoryTag category={report.category} />
          {report.aiDetection && (
            <AIBadge classification={report.aiDetection.classification} confidence={report.aiDetection.confidence} />
          )}
        </div>
        <div className="flex items-center justify-between pt-2 text-xs text-ink-700">
          <span className="truncate">{report.address || 'Location pinned on map'}</span>
          <span className="flex items-center gap-1 text-ink-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            {report.confirmationCount || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
