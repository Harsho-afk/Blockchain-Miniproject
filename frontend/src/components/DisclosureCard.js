import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DisclosureCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const { blockHash, blockIndex, timestamp, disclosure } = item;
  const aiUsed = disclosure?.aiUsed;
  const previewText = (disclosure?.content || disclosure?.description || '').trim();
  const hasPreview = previewText.length > 0;
  const truncated = hasPreview && previewText.length > 240;
  const shownText = expanded || !truncated ? previewText : `${previewText.slice(0, 240)}...`;

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      background: 'var(--surface)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{disclosure?.title || 'Untitled'}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>by {disclosure?.author || 'Anonymous'}</div>
        </div>
        <span style={{
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 4,
          background: aiUsed ? 'var(--accent-soft)' : 'var(--green-soft)',
          color: aiUsed ? 'var(--accent)' : 'var(--green)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          {aiUsed ? 'AI Used' : 'Human'}
        </span>
      </div>

      {aiUsed && disclosure?.aiTools?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {disclosure.aiTools.map(t => (
            <span key={t} style={{
              fontSize: 11,
              padding: '1px 6px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text2)',
            }}>{t}</span>
          ))}
        </div>
      )}

      {hasPreview && (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          background: 'var(--surface-2)',
          padding: '12px',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Content
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {shownText}
          </div>
          {truncated && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                marginTop: 10,
                padding: 0,
                border: 'none',
                background: 'transparent',
                color: 'var(--accent)',
                fontSize: 12,
              }}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: 16,
        fontSize: 11,
        color: 'var(--text3)',
        borderTop: '1px solid var(--border)',
        paddingTop: 10,
      }}>
        <span>#{blockIndex}</span>
        <span>{blockHash?.slice(0, 12)}...</span>
        <span>{timeAgo(timestamp)}</span>
        {aiUsed && <span>{disclosure?.aiPercentage ?? 0}% AI</span>}
      </div>

      <Link to={`/blocks/${blockHash}`} style={{
        fontSize: 12,
        color: 'var(--accent)',
        alignSelf: 'flex-start',
      }}>
        Open block →
      </Link>
    </div>
  );
}
