import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LampMark from '../components/LampMark';
import api from '../api/axios';

const STEPS = [
  {
    title: 'Spot it',
    body: 'See a dark, flickering, or missing streetlight on your walk home. Open Shadow Alert and snap a photo.',
  },
  {
    title: 'AI reads the scene',
    body: 'Our detection engine measures brightness and contrast in the photo to flag whether the lamp looks lit or dark.',
  },
  {
    title: 'Crews get to it',
    body: 'Your city\u2019s operations team sees verified, prioritized reports on one map instead of scattered phone calls.',
  },
];

export default function Landing() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(() => setStats(null));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-midnight-700/70 bg-lamp-glow">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="pill mb-6 border border-glow/30 bg-glow/10 text-glow">
              Community-powered street safety
            </span>
            <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.1] text-ink-100 sm:text-5xl">
              Every dark streetlight, seen and reported before it becomes a hazard.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-300">
              Shadow Alert lets residents photograph broken or missing streetlights. An on-device brightness
              analysis flags likely outages instantly, so city crews fix the right lights first.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary text-base">
                Report a streetlight
              </Link>
              <Link to="/map" className="btn-secondary text-base">
                View the live map
              </Link>
            </div>
            {stats && (
              <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-midnight-700 pt-6">
                <div>
                  <p className="font-display text-2xl font-bold text-ink-100">{stats.total}</p>
                  <p className="text-xs text-ink-500">Reports filed</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-signal">{stats.resolved}</p>
                  <p className="text-xs text-ink-500">Lights fixed</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-glow">
                    {stats.avgResolutionHours ? `${Math.round(stats.avgResolutionHours / 24)}d` : '—'}
                  </p>
                  <p className="text-xs text-ink-500">Avg. time to fix</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative mx-auto flex h-80 w-full max-w-md items-center justify-center sm:h-96">
            <div className="absolute h-64 w-64 rounded-full bg-glow/10 blur-3xl" />
            <LampMark className="relative h-56 w-56 text-ink-300 sm:h-72 sm:w-72" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-ink-100 sm:text-3xl">How Shadow Alert works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card p-6">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-glow/15 font-display font-bold text-glow">
                {i + 1}
              </div>
              <h3 className="font-display text-lg font-semibold text-ink-100">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-midnight-700/70">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-100">Your street is safer when it\u2019s lit.</h2>
            <p className="mt-2 text-ink-500">Create a free account and file your first report in under a minute.</p>
          </div>
          <Link to="/register" className="btn-primary text-base">
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
