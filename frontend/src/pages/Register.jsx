import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LampMark from '../components/LampMark';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', ward: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <LampMark className="h-12 w-12 text-glow" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-100">Create your account</h1>
        <p className="mt-1 text-sm text-ink-500">Join your neighbors keeping the streets lit.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {error && (
          <p className="rounded-lg border border-alert/40 bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>
        )}
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" name="name" required className="input-field" placeholder="Jordan Lee" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required className="input-field" placeholder="you@example.com" value={form.email} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="phone" className="label">Phone (optional)</label>
            <input id="phone" name="phone" className="input-field" placeholder="555-0100" value={form.phone} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="ward" className="label">Ward / area</label>
            <input id="ward" name="ward" className="input-field" placeholder="Ward 4" value={form.ward} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" required className="input-field" placeholder="At least 6 characters" value={form.password} onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-glow hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
