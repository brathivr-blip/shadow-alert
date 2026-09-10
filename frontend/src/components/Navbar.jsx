import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import LampMark from './LampMark';

const linkClasses = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive ? 'text-glow bg-glow/10' : 'text-ink-300 hover:text-ink-100 hover:bg-midnight-700/60'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = user
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/reports', label: 'Reports' },
        { to: '/map', label: 'Map' },
        { to: '/report/new', label: 'Report a light' },
        ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
      ]
    : [
        { to: '/reports', label: 'Reports' },
        { to: '/map', label: 'Map' },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-midnight-700/80 bg-midnight-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 text-ink-100">
          <LampMark className="h-7 w-7 text-glow" />
          <span className="font-display text-lg font-bold tracking-tight">Shadow Alert</span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClasses}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <NavLink to="/profile" className="hidden sm:flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-midnight-700/60">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-midnight-950"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </span>
              </NavLink>
              <button type="button" onClick={handleLogout} className="btn-secondary hidden sm:inline-flex !px-3 !py-1.5 text-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-secondary !px-4 !py-1.5 text-sm">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn-primary !px-4 !py-1.5 text-sm">
                Get started
              </NavLink>
            </>
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-ink-300 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-midnight-700 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClasses} onClick={() => setMenuOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/profile" className={linkClasses} onClick={() => setMenuOpen(false)}>
                  Profile
                </NavLink>
                <button type="button" onClick={handleLogout} className="btn-secondary mt-2 w-full">
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClasses} onClick={() => setMenuOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/register" className="btn-primary mt-2 w-full" onClick={() => setMenuOpen(false)}>
                  Get started
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
