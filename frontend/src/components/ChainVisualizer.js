import React, { useEffect, useState } from 'react';

const s = {
  wrap: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    overflowX: 'auto',
  },
  label: {
    fontSize: 11,
    color: 'var(--text3)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-mono)',
    marginBottom: 16,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    minWidth: 'max-content',
  },
  block: {
    width: 100,
    height: 72,
    borderRadius: 8,
    border: '1px solid var(--border2)',
    background: 'var(--surface2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: '8px',
    transition: 'all 0.2s',
    cursor: 'default',
    flexShrink: 0,
  },
  blockLatest: {
    borderColor: 'var(--accent)',
    background: 'rgba(0,229,255,0.05)',
    boxShadow: '0 0 16px rgba(0,229,255,0.12)',
  },
  blockGenesis: {
    borderColor: 'rgba(124,58,237,0.5)',
    background: 'rgba(124,58,237,0.06)',
  },
  blockAI: {
    borderColor: 'rgba(0,119,255,0.4)',
    background: 'rgba(0,119,255,0.04)',
  },
  blockHuman: {
    borderColor: 'rgba(0,255,136,0.3)',
    background: 'rgba(0,255,136,0.04)',
  },
  blockIdx: {
    fontSize: 10,
    color: 'var(--text3)',
    fontFamily: 'var(--font-mono)',
  },
  blockType: {
    fontSize: 9,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  blockHash: {
    fontSize: 9,
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
  },
  arrow: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px',
    color: 'var(--border2)',
    fontSize: 18,
    flexShrink: 0,
  },
  tooltip: {
    position: 'absolute',
    bottom: '110%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--bg)',
    border: '1px solid var(--border2)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    zIndex: 10,
    pointerEvents: 'none',
  },
};

function BlockNode({ block, isLatest }) {
  const [hovered, setHovered] = useState(false);
  const isGenesis = block.data?.type === 'GENESIS';
  const aiUsed = block.data?.aiUsed;

  let extraStyle = {};
  if (isLatest) extraStyle = s.blockLatest;
  else if (isGenesis) extraStyle = s.blockGenesis;
  else if (aiUsed === true) extraStyle = s.blockAI;
  else if (aiUsed === false) extraStyle = s.blockHuman;

  const typeLabel = isGenesis ? 'GENESIS' : aiUsed ? 'AI' : 'HUMAN';
  const typeColor = isGenesis ? '#a78bfa' : aiUsed ? 'var(--accent2)' : 'var(--green)';

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{ ...s.block, ...extraStyle }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span style={s.blockIdx}>#{block.index}</span>
        <span style={{ ...s.blockType, color: typeColor }}>{typeLabel}</span>
        <span style={s.blockHash}>{block.hash?.slice(0, 8)}</span>
      </div>

      {hovered && (
        <div style={s.tooltip}>
          <div style={{ color: 'var(--text3)', marginBottom: 4 }}>Block #{block.index}</div>
          {block.data?.title && <div style={{ color: 'var(--text)' }}>{block.data.title.slice(0, 28)}</div>}
          <div style={{ color: 'var(--accent)', marginTop: 2 }}>{block.hash?.slice(0, 20)}...</div>
          <div style={{ color: 'var(--text3)', fontSize: 9, marginTop: 2 }}>
            {new Date(block.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChainVisualizer({ chain = [] }) {
  const visible = chain.slice(-10); // Show last 10 blocks

  return (
    <div style={s.wrap}>
      <div style={s.label}>⛓ Live Chain — last {visible.length} blocks</div>
      <div style={s.row}>
        {visible.map((block, i) => (
          <React.Fragment key={block.hash || i}>
            {i > 0 && <div style={s.arrow}>→</div>}
            <BlockNode block={block} isLatest={i === visible.length - 1} />
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { color: '#a78bfa', label: 'Genesis' },
          { color: 'var(--accent2)', label: 'AI Used' },
          { color: 'var(--green)', label: 'Human Only' },
          { color: 'var(--accent)', label: 'Latest' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
