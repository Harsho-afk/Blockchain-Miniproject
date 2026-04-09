import React from 'react';

export default function StatCard({ label, value, sub, accent, icon }) {
  const styles = {
    card: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      transition: 'border-color 0.2s',
      cursor: 'default',
    },
    top: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text3)',
      fontFamily: 'var(--font-mono)',
    },
    icon: {
      fontSize: 18,
      opacity: 0.7,
    },
    value: {
      fontSize: 36,
      fontWeight: 800,
      letterSpacing: '-0.03em',
      color: accent || 'var(--text)',
      lineHeight: 1,
      fontFamily: 'var(--font-sans)',
    },
    sub: {
      fontSize: 12,
      color: 'var(--text3)',
      fontFamily: 'var(--font-mono)',
    },
    bar: {
      height: 2,
      background: accent || 'var(--accent)',
      borderRadius: 1,
      marginTop: 4,
      opacity: 0.4,
    }
  };

  return (
    <div style={styles.card}
      onMouseEnter={e => e.currentTarget.style.borderColor = accent || 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={styles.top}>
        <span style={styles.label}>{label}</span>
        {icon && <span style={styles.icon}>{icon}</span>}
      </div>
      <div style={styles.value}>{value ?? '—'}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
      <div style={styles.bar} />
    </div>
  );
}
