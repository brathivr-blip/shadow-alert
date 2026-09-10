import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Eye, EyeOff, LockKeyhole, Mail, Radar, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import LampMark from '../components/LampMark';
import LoginAtmosphere from '../components/LoginAtmosphere';
import './login.css';

const DEMO_EMAIL = 'demo@shadowalert.com';
const DEMO_PASSWORD = 'Shadow@2026';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageRef = useRef(null);
  const cardRef = useRef(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ripple, setRipple] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    const elements = pageRef.current?.querySelectorAll('[data-login-entrance]');
    if (!elements?.length) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(elements, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' });
    }, pageRef);
    return () => context.revert();
  }, []);

  const handleCardMove = (event) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
    const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -5;
    card.style.setProperty('--tilt-x', `${rotateX}deg`);
    card.style.setProperty('--tilt-y', `${rotateY}deg`);
  };

  const resetCardTilt = () => {
    cardRef.current?.style.setProperty('--tilt-x', '0deg');
    cardRef.current?.style.setProperty('--tilt-y', '0deg');
  };

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleDemoMode = () => {
    setForm({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    setRipple(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log in. Check your credentials.');
    } finally {
      setLoading(false);
      window.setTimeout(() => setRipple(false), 650);
    }
  };

  return (
    <div ref={pageRef} className="login-page">
      <LoginAtmosphere />

      <header className="login-nav" data-login-entrance>
        <Link to="/" className="login-brand" aria-label="Shadow Alert home">
          <LampMark className="login-brand-mark" />
          <span>Shadow Alert</span>
        </Link>
        <nav className="login-nav-links" aria-label="Primary navigation">
          <Link to="/reports" className="login-nav-link">Reports</Link>
          <Link to="/map" className="login-nav-link">Map</Link>
          <button type="button" className="login-demo-button" onClick={handleDemoMode}>Demo Mode</button>
        </nav>
      </header>

      <main className="login-main">
        <div className="login-stage">
          <motion.aside className="login-feature login-feature-left" data-login-entrance whileHover={{ y: -8, scale: 1.03 }}>
            <Activity className="login-feature-icon" />
            <strong>Real-time Monitoring Across Your City</strong>
            <span>See the lights that need attention before the street goes dark.</span>
          </motion.aside>

          <div className="login-card-wrap" data-login-entrance>
            <motion.section
              ref={cardRef}
              className="login-card"
              onMouseMove={handleCardMove}
              onMouseLeave={resetCardTilt}
              style={{ transform: 'rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))' }}
            >
              <div className="login-card-header">
                <LampMark className="login-card-logo" />
                <h1>Welcome back</h1>
                <p className="login-subtitle">Light up the streets. Keep your community safe.</p>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {error && <p className="login-error" role="alert">{error}</p>}

                <div className="login-field">
                  <Mail className="login-field-icon" aria-hidden="true" />
                  <input id="email" name="email" type="email" required placeholder=" " autoComplete="email" value={form.email} onChange={handleChange} />
                  <label htmlFor="email">Email address</label>
                </div>

                <div className="login-field">
                  <LockKeyhole className="login-field-icon" aria-hidden="true" />
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required placeholder=" " autoComplete="current-password" value={form.password} onChange={handleChange} />
                  <label htmlFor="password">Password</label>
                  <button type="button" className="login-eye" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                <motion.button type="submit" disabled={loading} className="login-submit" whileTap={{ scale: 0.98 }}>
                  {loading ? <span className="login-spinner" aria-label="Loading" /> : <Sparkles size={17} />}
                  {loading ? 'Connecting...' : 'Enter Shadow Alert'}
                  {ripple && <span className="login-ripple" />}
                </motion.button>
              </form>

              <p className="login-demo-hint">Use Demo Mode for instant access</p>
              <p className="login-register">New to Shadow Alert? <Link to="/register">Create an account</Link></p>
            </motion.section>
          </div>

          <motion.aside className="login-feature login-feature-right" data-login-entrance whileHover={{ y: 8, scale: 1.03 }}>
            <Radar className="login-feature-icon" />
            <strong>AI Powered Streetlight Detection</strong>
            <span>Brightness intelligence turns a single photo into a priority signal.</span>
          </motion.aside>
        </div>
      </main>

      <footer className="login-footer">SMARTER STREETS <span aria-hidden="true">•</span> SAFER COMMUNITIES</footer>
    </div>
  );
}
