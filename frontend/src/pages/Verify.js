import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyBlock } from '../utils/api';

const input = {
  width: '100%', padding: '8px 12px',
  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  color: 'var(--text)', background: 'var(--surface)', fontSize: 13,
  outline: 'none', fontFamily: 'inherit',
};

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [blockHash, setBlockHash] = useState(searchParams.get('hash') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const h = searchParams.get('hash');
    if (h) { setBlockHash(h); }
  }, [searchParams]);

  const verifyByHash = async () => {
    if (!blockHash.trim()) return setError('Enter a block hash.');
    setError(''); setLoading(true); setResult(null);
    try { setResult({ type: 'hash', data: await verifyBlock(blockHash.trim()) }); }
    catch (e) { setError(e.response?.data?.error || 'Verification failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Verify Disclosure</h1>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 32 }}>Check a disclosure's authenticity by block hash.</p>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Block Hash</label>
        <input style={input} value={blockHash} onChange={e => setBlockHash(e.target.value)} placeholder="Enter block hash..." />
        {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>{error}</div>}
        <button onClick={verifyByHash} disabled={loading} style={{ marginTop: 12, padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </div>

      {result && result.type === 'hash' && (
        <div style={{ marginTop: 32, border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 20 }}>{result.data.verified ? '✓' : '✗'}</span>
            <div>
              <div style={{ fontWeight: 700, color: result.data.verified ? 'var(--green)' : 'var(--red)' }}>
                {result.data.verified ? 'Block Verified' : 'Verification Failed'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                {result.data.verified ? 'Authentic and unaltered' : 'Could not verify this block'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[
              ['Block found', result.data.blockFound],
              ['Hash integrity', result.data.hashIntegrity],
              ['Chain integrity', result.data.chainIntegrity],
            ].map(([lbl, pass]) => (
              <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)' }}>{lbl}</span>
                <span style={{ fontWeight: 600, color: pass ? 'var(--green)' : 'var(--red)' }}>
                  {pass ? 'Pass' : 'Fail'}
                </span>
              </div>
            ))}
          </div>

          {result.data.block?.data && (() => {
            const d = result.data.block.data;
            return (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 12 }}>Disclosure Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['Title', d.title], ['Author', d.author],
                    ['AI Used', d.aiUsed ? 'Yes' : 'No'],
                    ['Tools', d.aiTools?.join(', ') || 'None'],
                    ['AI %', d.aiUsed ? `${d.aiPercentage}%` : 'N/A'],
                    ['License', d.license],
                    ['Block #', result.data.block?.index],
                    ['Submitted', d.submittedAt ? new Date(d.submittedAt).toLocaleString() : '—'],
                  ].filter(([, v]) => v != null).map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--surface-2)', borderRadius: 4, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 12 }}>{String(v)}</div>
                    </div>
                  ))}
                </div>
                {d.aiUsageDetails && (
                  <div style={{ marginTop: 8, background: 'var(--surface-2)', borderRadius: 4, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>AI Usage Details</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}>{d.aiUsageDetails}</div>
                  </div>
                )}
                {(d.content || d.description) && (
                  <div style={{ marginTop: 8, background: 'var(--surface-2)', borderRadius: 4, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>Stored Content</div>
                    <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {d.content || d.description}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
