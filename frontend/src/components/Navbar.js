import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid var(--border)',
    backdropFilter: 'blur(20px)',
    background: 'rgba(5, 8, 16, 0.85)',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  logoIcon: {
    width: 32,
    height: 32,
    background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
  },
  logoText: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 800,
    fontSize: 18,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
  },
  logoSub: {
    color: 'var(--accent)',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  link: {
    padding: '6px 14px',
    borderRadius: 'var(--radius)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text2)',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-sans)',
  },
  linkActive: {
    color: 'var(--accent)',
    background: 'rgba(0, 229, 255, 0.08)',
  },
  chainStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 20,
    border: '1px solid var(--border)',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text2)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--green)',
    boxShadow: '0 0 6px var(--green)',
    animation: 'pulse-glow 2s infinite',
  },
};

const NAV_LINKS = [
  { path: '/', label: 'Dashboard' },
  { path: '/submit', label: 'Submit' },
  { path: '/verify', label: 'Verify' },
  { path: '/explorer', label: 'Explorer' },
];

export default function Navbar() {
  const location = useLocation();
  const [blockCount, setBlockCount] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/stats')
      .then(r => r.json())
      .then(d => setBlockCount(d.totalBlocks))
      .catch(() => {});
  }, [location]);

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>⛓</div>
          <span style={styles.logoText}>
            Chain<span style={styles.logoSub}>Disclosure</span>
          </span>
        </Link>

        <div style={styles.links}>
          {NAV_LINKS.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                ...styles.link,
                ...(location.pathname === path ? styles.linkActive : {}),
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div style={styles.chainStatus}>
          <div style={styles.dot} />
          {blockCount !== null ? `${blockCount} blocks` : 'connecting...'}
        </div>
      </div>
    </nav>
  );
}
