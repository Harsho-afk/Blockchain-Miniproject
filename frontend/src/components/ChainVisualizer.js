import React, { useState } from 'react';

function Block({ block, isLatest }) {
  const [hovered, setHovered] = useState(false);
  const isGenesis = block.data?.type === 'GENESIS';
  const aiUsed = block.data?.aiUsed;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 72,
          height: 56,
          border: `1px solid ${isLatest ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          background: isLatest ? 'var(--accent-soft)' : 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          cursor: 'default',
          fontSize: 11,
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'var(--text3)' }}>#{block.index}</span>
        <span style={{
          fontWeight: 600,
          color: isGenesis ? 'var(--text2)' : aiUsed ? 'var(--accent)' : 'var(--green)',
        }}>
          {isGenesis ? 'GEN' : aiUsed ? 'AI' : 'HUM'}
        </span>
        <span style={{ color: 'var(--text3)', fontSize: 10 }}>{block.hash?.slice(0, 6)}</span>
      </div>

      {hovered && block.data?.title && (
        <div style={{
          position: 'absolute',
          bottom: '110%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--surface-3)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '6px 10px',
          fontSize: 11,
          whiteSpace: 'nowrap',
          zIndex: 10,
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        }}>
          {block.data.title.slice(0, 30)}
        </div>
      )}
    </div>
  );
}

export default function ChainVisualizer({ chain = [] }) {
  const visible = chain.slice(-12);
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      overflowX: 'auto',
      background: 'var(--surface)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>
        Chain — last {visible.length} blocks
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 'max-content' }}>
        {visible.map((block, i) => (
          <React.Fragment key={block.hash || i}>
            {i > 0 && <span style={{ color: 'var(--border)', fontSize: 12, flexShrink: 0 }}>→</span>}
            <Block block={block} isLatest={i === visible.length - 1} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
