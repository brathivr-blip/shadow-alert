import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AIBadge from '../components/AIBadge';
import Loader from '../components/Loader';

const STATUS_FLOW = ['pending', 'verified', 'in_progress', 'resolved', 'rejected'];

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('-priorityScore');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports', {
        params: { status: statusFilter || undefined, sort, limit: 50 },
      });
      setReports(data.reports);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/reports/${id}/status`, { status });
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } finally {
      setBusyId(null);
    }
  };

  const removeReport = async (id) => {
    if (!window.confirm('Delete this report permanently?')) return;
    await api.delete(`/reports/${id}`);
    setReports((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-100">Operations console</h1>
          <p className="mt-1 text-ink-500">Triage reports by priority and update their status.</p>
        </div>
        <div className="flex gap-2">
          <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <select className="input-field" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="-priorityScore">Highest priority</option>
            <option value="-createdAt">Newest first</option>
            <option value="-confirmationCount">Most confirmed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading reports" />
      ) : reports.length === 0 ? (
        <div className="card p-10 text-center text-ink-500">Nothing to triage right now.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-midnight-600 text-xs uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">AI reading</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Confirms</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-b border-midnight-700/60 last:border-0 hover:bg-midnight-700/30">
                  <td className="px-4 py-3">
                    <Link to={`/reports/${r._id}`} className="font-medium text-ink-100 hover:text-glow">
                      {r.title}
                    </Link>
                    <p className="text-xs text-ink-700">{r.address || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <AIBadge classification={r.aiDetection.classification} confidence={r.aiDetection.confidence} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={r.priorityScore >= 70 ? 'font-semibold text-alert' : 'text-ink-300'}>
                      {r.priorityScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-300">{r.confirmationCount || 0}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input-field !py-1.5 text-xs"
                      value={r.status}
                      disabled={busyId === r._id}
                      onChange={(e) => changeStatus(r._id, e.target.value)}
                    >
                      {STATUS_FLOW.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => removeReport(r._id)} className="text-xs font-semibold text-alert hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
