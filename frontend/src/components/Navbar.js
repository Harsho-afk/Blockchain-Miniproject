import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
    <nav style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(0, 0, 0, 0.92)',
      backdropFilter: 'blur(14px)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '0 24px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 32,
      }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 15 }}>
          ChainDisclosure
        </Link>

        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {NAV_LINKS.map(({ path, label }) => (
            <Link key={path} to={path} style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              color: location.pathname === path ? 'var(--accent)' : 'var(--text2)',
              background: location.pathname === path ? 'var(--accent-soft)' : 'transparent',
              fontWeight: location.pathname === path ? 600 : 400,
            }}>
              {label}
            </Link>
          ))}
        </div>

        <span style={{ fontSize: 12, color: 'var(--text3)' }}>
          {blockCount !== null ? `${blockCount} blocks` : '...'}
        </span>
      </div>
    </nav>
  );
}
