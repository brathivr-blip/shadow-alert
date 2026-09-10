import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ReportCard from '../components/ReportCard';

const STATUS_COLORS = {
  pending: '#8592AD',
  verified: '#F5A623',
  inProgress: '#60A5FA',
  resolved: '#34D399',
  rejected: '#E5484D',
};

const CATEGORY_LABELS = {
  missing: 'Missing',
  not_working: 'Dark',
  flickering: 'Flickering',
  dim: 'Dim',
  damaged_pole: 'Damaged pole',
  daytime_burning: 'Day-burning',
};

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold" style={{ color: accent }}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/reports', { params: { mine: true, limit: 3, sort: '-createdAt' } }),
    ])
      .then(([statsRes, reportsRes]) => {
        setStats(statsRes.data.stats);
        setMyReports(reportsRes.data.reports);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <Loader label="Loading your dashboard" />;

  const pieData = [
    { name: 'Pending', value: stats.pending, color: STATUS_COLORS.pending },
    { name: 'Verified', value: stats.verified, color: STATUS_COLORS.verified },
    { name: 'In progress', value: stats.inProgress, color: STATUS_COLORS.inProgress },
    { name: 'Resolved', value: stats.resolved, color: STATUS_COLORS.resolved },
    { name: 'Rejected', value: stats.rejected, color: STATUS_COLORS.rejected },
  ].filter((d) => d.value > 0);

  const categoryData = Object.entries(stats.byCategory || {}).map(([key, value]) => ({
    name: CATEGORY_LABELS[key] || key,
    count: value,
  }));

  const timelineData = (stats.timeline || []).map((t) => ({ date: t._id.slice(5), count: t.count }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-100">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="mt-1 text-ink-500">Here's the state of streetlights across your city.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total reports" value={stats.total} accent="#EDF1F9" />
        <StatCard label="Pending" value={stats.pending} accent={STATUS_COLORS.pending} />
        <StatCard label="Resolved" value={stats.resolved} accent={STATUS_COLORS.resolved} />
        <StatCard label="Avg. fix time" value={stats.avgResolutionHours ? `${Math.round(stats.avgResolutionHours / 24)}d` : '—'} accent="#F5A623" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-2">
          <p className="mb-3 text-sm font-semibold text-ink-300">Status breakdown</p>
          {pieData.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-500">No reports yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="#0B1220" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#131B2E', border: '1px solid #28375A', borderRadius: 8, color: '#EDF1F9' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-ink-500">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>

        <div className="card p-5 lg:col-span-3">
          <p className="mb-3 text-sm font-semibold text-ink-300">Reports over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData}>
              <CartesianGrid stroke="#1B2740" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#5A657F" fontSize={12} />
              <YAxis stroke="#5A657F" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#131B2E', border: '1px solid #28375A', borderRadius: 8, color: '#EDF1F9' }} />
              <Line type="monotone" dataKey="count" stroke="#F5A623" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 lg:col-span-5">
          <p className="mb-3 text-sm font-semibold text-ink-300">Reports by category</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid stroke="#1B2740" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#5A657F" fontSize={12} />
              <YAxis stroke="#5A657F" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#131B2E', border: '1px solid #28375A', borderRadius: 8, color: '#EDF1F9' }} />
              <Bar dataKey="count" fill="#60A5FA" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink-100">Your recent reports</h2>
        <Link to="/reports?mine=true" className="text-sm text-glow hover:underline">View all</Link>
      </div>
      {myReports.length === 0 ? (
        <div className="card mt-4 p-8 text-center">
          <p className="text-ink-500">You haven't filed a report yet.</p>
          <Link to="/report/new" className="btn-primary mt-3 inline-flex">Report your first light</Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myReports.map((r) => (
            <ReportCard key={r._id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}
