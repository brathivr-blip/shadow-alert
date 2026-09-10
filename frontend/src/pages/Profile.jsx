import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', ward: user?.ward || '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await updateProfile(form);
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-4">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-midnight-950"
          style={{ backgroundColor: user.avatarColor }}
        >
          {user.name?.[0]?.toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-100">{user.name}</h1>
          <p className="text-sm text-ink-500">{user.email}</p>
          <p className="mt-1 text-xs text-glow">{user.points} community points · {user.role}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {message && <p className="rounded-lg border border-signal/40 bg-signal/10 px-3 py-2 text-sm text-signal">{message}</p>}
        {error && <p className="rounded-lg border border-alert/40 bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>}

        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" name="name" className="input-field" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="phone" className="label">Phone</label>
          <input id="phone" name="phone" className="input-field" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="ward" className="label">Ward / area</label>
          <input id="ward" name="ward" className="input-field" value={form.ward} onChange={handleChange} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
