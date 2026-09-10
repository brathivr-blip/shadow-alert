import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import AIBadge from '../components/AIBadge';
import CategoryTag from '../components/CategoryTag';
import MapView from '../components/MapView';
import Loader from '../components/Loader';

const STATUS_FLOW = ['pending', 'verified', 'in_progress', 'resolved', 'rejected'];

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/${id}`);
      setReport(data.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load this report.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const { data } = await api.post(`/reports/${id}/confirm`);
      setReport(data.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not confirm this report.');
    } finally {
      setConfirming(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    const { data } = await api.post(`/reports/${id}/notes`, { text: noteText });
    setReport(data.report);
    setNoteText('');
  };

  const handleStatusChange = async (status) => {
    setStatusUpdating(true);
    try {
      const { data } = await api.patch(`/reports/${id}/status`, { status });
      setReport(data.report);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) return <Loader label="Loading report" />;
  if (error && !report) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-alert">{error}</p>
        <Link to="/reports" className="btn-secondary mt-4 inline-flex">Back to reports</Link>
      </div>
    );
  }
  if (!report) return null;

  const [lng, lat] = report.location.coordinates;
  const alreadyConfirmed = user && report.confirmations?.some((c) => (c._id || c) === user.id);
  const isOwner = user && (report.reporter?._id || report.reporter) === user.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/reports" className="text-sm text-ink-500 hover:text-glow">&larr; Back to reports</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <img src={report.imageUrl} alt={report.title} className="w-full rounded-2xl border border-midnight-600 object-cover" style={{ maxHeight: 420 }} />
        </div>

        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={report.status} />
            <CategoryTag category={report.category} />
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink-100">{report.title}</h1>
          <p className="mt-2 text-sm text-ink-300">{report.description}</p>

          <div className="mt-5 card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">AI photo analysis</p>
            <div className="mt-2">
              <AIBadge classification={report.aiDetection.classification} confidence={report.aiDetection.confidence} />
            </div>
            <p className="mt-2 text-xs text-ink-500">{report.aiDetection.summary}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-midnight-900 p-2">
                <dt className="text-ink-700">Brightness</dt>
                <dd className="font-semibold text-ink-100">{report.aiDetection.avgBrightness}/255</dd>
              </div>
              <div className="rounded-lg bg-midnight-900 p-2">
                <dt className="text-ink-700">Contrast</dt>
                <dd className="font-semibold text-ink-100">{report.aiDetection.contrastScore}</dd>
              </div>
              <div className="rounded-lg bg-midnight-900 p-2">
                <dt className="text-ink-700">Priority</dt>
                <dd className="font-semibold text-glow">{report.priorityScore}/100</dd>
              </div>
            </dl>
          </div>

          <p className="mt-4 text-sm text-ink-500">{report.address}</p>
          <p className="text-xs text-ink-700">Reported by {report.reporterName}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {user && !isOwner && (
              <button type="button" onClick={handleConfirm} disabled={confirming || alreadyConfirmed} className="btn-secondary text-sm">
                {alreadyConfirmed ? `Confirmed (${report.confirmationCount})` : `I see this too (${report.confirmationCount})`}
              </button>
            )}
            {!user && <span className="text-xs text-ink-700">{report.confirmationCount} neighbors confirmed this</span>}
          </div>

          {user?.role === 'admin' && (
            <div className="mt-5 card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Admin: update status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUS_FLOW.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={statusUpdating || report.status === s}
                    onClick={() => handleStatusChange(s)}
                    className={`pill border transition ${
                      report.status === s
                        ? 'border-glow bg-glow/15 text-glow'
                        : 'border-midnight-600 text-ink-300 hover:border-glow hover:text-glow'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink-100">Location</h2>
        <div className="mt-3">
          <MapView reports={[report]} center={[lat, lng]} zoom={16} height="320px" />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink-100">Discussion &amp; updates</h2>
        <div className="mt-4 space-y-3">
          {report.statusHistory.map((h, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm text-ink-500">
              <span className="h-2 w-2 rounded-full bg-glow" />
              Status set to <StatusBadge status={h.status} /> by {h.changedBy} ·{' '}
              {new Date(h.changedAt).toLocaleString()}
            </div>
          ))}
          {report.notes.map((n) => (
            <div key={n._id} className="card p-3 text-sm">
              <p className="font-medium text-ink-100">{n.authorName || n.author?.name}</p>
              <p className="mt-1 text-ink-300">{n.text}</p>
              <p className="mt-1 text-xs text-ink-700">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {user && (
          <form onSubmit={handleAddNote} className="mt-4 flex gap-2">
            <input
              className="input-field"
              placeholder="Add an update or comment…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button type="submit" className="btn-primary shrink-0">Post</button>
          </form>
        )}
      </div>
    </div>
  );
}
