import React from 'react';
import { Link } from 'react-router-dom';

function truncateHash(hash, len = 8) {
  if (!hash) return '';
  return `${hash.slice(0, len)}...${hash.slice(-4)}`;
}

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DisclosureCard({ item }) {
  const { blockHash, blockIndex, timestamp, disclosure } = item;
  const aiUsed = disclosure?.aiUsed;

  const styles = {
    card: {
      background: 'var(--surface)',
      border: `1px solid ${aiUsed ? 'rgba(0,119,255,0.25)' : 'rgba(0,255,136,0.15)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      background: aiUsed ? 'rgba(0,119,255,0.15)' : 'rgba(0,255,136,0.1)',
      color: aiUsed ? 'var(--accent2)' : 'var(--green)',
      border: `1px solid ${aiUsed ? 'rgba(0,119,255,0.3)' : 'rgba(0,255,136,0.2)'}`,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: aiUsed ? 'var(--accent2)' : 'var(--green)',
    },
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--text)',
      fontFamily: 'var(--font-sans)',
    },
    author: {
      fontSize: 13,
      color: 'var(--text2)',
      marginTop: 3,
    },
    meta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      borderTop: '1px solid var(--border)',
      paddingTop: 14,
    },
    metaItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    metaLabel: {
      fontSize: 10,
      color: 'var(--text3)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontFamily: 'var(--font-mono)',
    },
    metaValue: {
      fontSize: 12,
      color: 'var(--text2)',
      fontFamily: 'var(--font-mono)',
    },
    tools: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
    },
    tool: {
      padding: '2px 8px',
      background: 'rgba(124,58,237,0.12)',
      border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: 4,
      fontSize: 11,
      color: '#a78bfa',
      fontFamily: 'var(--font-mono)',
    },
    verifyBtn: {
      alignSelf: 'flex-start',
      padding: '6px 14px',
      background: 'transparent',
      border: '1px solid var(--border2)',
      borderRadius: 'var(--radius)',
      color: 'var(--text2)',
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'all 0.15s',
    },
    blockNum: {
      position: 'absolute',
      top: 12,
      right: 16,
      fontSize: 11,
      color: 'var(--text3)',
      fontFamily: 'var(--font-mono)',
    },
  };

  return (
    <div style={styles.card}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = aiUsed ? 'rgba(0,119,255,0.5)' : 'rgba(0,255,136,0.35)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = aiUsed ? 'rgba(0,119,255,0.25)' : 'rgba(0,255,136,0.15)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <span style={styles.blockNum}>#{blockIndex}</span>

      <div style={styles.header}>
        <div>
          <div style={styles.title}>{disclosure?.title || 'Untitled'}</div>
          <div style={styles.author}>by {disclosure?.author || 'Anonymous'}</div>
        </div>
        <span style={styles.badge}>
          <span style={styles.dot} />
          {aiUsed ? 'AI Used' : 'Human Only'}
        </span>
      </div>

      {aiUsed && disclosure?.aiTools?.length > 0 && (
        <div style={styles.tools}>
          {disclosure.aiTools.map(t => (
            <span key={t} style={styles.tool}>{t}</span>
          ))}
        </div>
      )}

      <div style={styles.meta}>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Block Hash</span>
          <span style={styles.metaValue}>{truncateHash(blockHash, 10)}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Content Hash</span>
          <span style={styles.metaValue}>{truncateHash(disclosure?.contentHash, 10)}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Submitted</span>
          <span style={styles.metaValue}>{timeAgo(timestamp)}</span>
        </div>
        {aiUsed && (
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>AI %</span>
            <span style={styles.metaValue}>{disclosure?.aiPercentage ?? 0}%</span>
          </div>
        )}
      </div>

      <Link
        to={`/verify?hash=${blockHash}`}
        style={styles.verifyBtn}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}
      >
        → Verify on chain
      </Link>
    </div>
  );
}
