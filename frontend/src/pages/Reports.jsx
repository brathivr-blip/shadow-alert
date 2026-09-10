import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ReportCard from '../components/ReportCard';
import Loader from '../components/Loader';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'missing', label: 'Missing pole/fixture' },
  { value: 'not_working', label: 'Completely dark' },
  { value: 'flickering', label: 'Flickering' },
  { value: 'dim', label: 'Too dim' },
  { value: 'damaged_pole', label: 'Damaged pole' },
  { value: 'daytime_burning', label: 'Burning in daylight' },
];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '', page: 1, sort: '-createdAt' });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports', { params: { ...filters, limit: 12 } });
      setReports(data.reports);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-100">Community reports</h1>
          <p className="mt-1 text-ink-500">Browse everything the neighborhood has flagged so far.</p>
        </div>
        <Link to="/report/new" className="btn-primary">
          + New report
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="input-field sm:max-w-xs"
          placeholder="Search title, description, address…"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        <select className="input-field sm:max-w-[200px]" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select className="input-field sm:max-w-[220px]" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select className="input-field sm:max-w-[200px]" value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
          <option value="-createdAt">Newest first</option>
          <option value="-priorityScore">Highest priority</option>
          <option value="-confirmationCount">Most confirmed</option>
        </select>
      </div>

      {loading ? (
        <Loader label="Loading reports" />
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-ink-300">No reports match those filters yet.</p>
          <Link to="/report/new" className="btn-primary mt-4 inline-flex">Be the first to report one</Link>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((r) => (
              <ReportCard key={r._id} report={r} />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: pagination.page - 1 }))}
                className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-ink-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setFilters((f) => ({ ...f, page: pagination.page + 1 }))}
                className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
