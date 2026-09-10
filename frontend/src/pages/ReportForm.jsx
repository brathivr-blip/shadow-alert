import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = [
  { value: 'not_working', label: 'Completely dark / not working' },
  { value: 'missing', label: 'Pole or fixture is missing' },
  { value: 'flickering', label: 'Flickering on and off' },
  { value: 'dim', label: 'Much dimmer than it should be' },
  { value: 'damaged_pole', label: 'Pole is damaged / leaning' },
  { value: 'daytime_burning', label: 'Stays on during the day (wasting power)' },
];

export default function ReportForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'not_working',
    latitude: '',
    longitude: '',
    address: '',
    isSensitiveZone: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser. Enter coordinates manually.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        setError('Could not get your location. Enter coordinates manually or check browser permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please attach a photo of the streetlight.');
      return;
    }
    if (!form.latitude || !form.longitude) {
      setError('Location is required — use "Use my location" or enter coordinates.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      payload.append('photo', file);

      const { data } = await api.post('/reports', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/reports/${data.report._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong submitting your report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-100">Report a streetlight</h1>
      <p className="mt-1 text-ink-500">
        A photo and a pinned location are all we need — our AI engine reads the brightness in your photo
        automatically.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5 p-6">
        {error && <p className="rounded-lg border border-alert/40 bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>}

        <div>
          <label className="label">Photo of the streetlight</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" id="photo-input" />
          <label
            htmlFor="photo-input"
            className="flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-midnight-600 bg-midnight-900 text-ink-500 transition hover:border-glow hover:text-glow"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16M14 14l1.6-1.6a2 2 0 0 1 2.8 0L20 14M4 8h16M4 4h16v16H4z" />
                </svg>
                <span className="text-sm">Tap to take or upload a photo</span>
              </>
            )}
          </label>
        </div>

        <div>
          <label htmlFor="title" className="label">Title</label>
          <input id="title" name="title" required maxLength={120} className="input-field" placeholder="Dark corner light on Maple & 5th" value={form.title} onChange={handleChange} />
        </div>

        <div>
          <label htmlFor="category" className="label">What's wrong?</label>
          <select id="category" name="category" className="input-field" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            maxLength={1000}
            className="input-field resize-none"
            placeholder="The light at the corner has been out for about a week..."
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="label !mb-0">Location</label>
            <button type="button" onClick={useMyLocation} disabled={locating} className="text-xs font-semibold text-glow hover:underline">
              {locating ? 'Locating…' : 'Use my location'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="latitude"
              required
              placeholder="Latitude"
              className="input-field"
              value={form.latitude}
              onChange={handleChange}
            />
            <input
              name="longitude"
              required
              placeholder="Longitude"
              className="input-field"
              value={form.longitude}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="label">Nearest address / landmark (optional)</label>
          <input id="address" name="address" className="input-field" placeholder="123 Maple St, near the bus stop" value={form.address} onChange={handleChange} />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-300">
          <input type="checkbox" name="isSensitiveZone" checked={form.isSensitiveZone} onChange={handleChange} className="h-4 w-4 rounded border-midnight-600 bg-midnight-900 text-glow focus:ring-glow" />
          This is near a school, hospital, crosswalk, or transit stop
        </label>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Analyzing photo & submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
