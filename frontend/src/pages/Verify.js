import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyBlock, verifyContent } from '../utils/api';

const input = {
  width: '100%', padding: '8px 12px',
  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  color: 'var(--text)', background: 'var(--bg)', fontSize: 13,
  outline: 'none', fontFamily: 'inherit',
};

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('hash');
  const [blockHash, setBlockHash] = useState(searchParams.get('hash') || '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const h = searchParams.get('hash');
    if (h) { setBlockHash(h); setTab('hash'); }
  }, [searchParams]);

  const verifyByHash = async () => {
    if (!blockHash.trim()) return setError('Enter a block hash.');
    setError(''); setLoading(true); setResult(null);
    try { setResult({ type: 'hash', data: await verifyBlock(blockHash.trim()) }); }
    catch (e) { setError(e.response?.data?.error || 'Verification failed.'); }
    finally { setLoading(false); }
  };

  const verifyByContent = async () => {
    if (!content.trim()) return setError('Enter content to verify.');
    setError(''); setLoading(true); setResult(null);
    try { setResult({ type: 'content', data: await verifyContent(content.trim()) }); }
    catch (e) { setError(e.response?.data?.error || 'Verification failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Verify Disclosure</h1>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 32 }}>Check any disclosure's authenticity on the blockchain.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {[['hash', 'By Block Hash'], ['content', 'By Content']].map(([k, lbl]) => (
          <button key={k} onClick={() => { setTab(k); setResult(null); setError(''); }} style={{
            padding: '8px 20px', border: 'none', background: 'transparent',
            color: tab === k ? 'var(--accent)' : 'var(--text3)',
            fontSize: 13, fontWeight: tab === k ? 600 : 400, cursor: 'pointer',
            borderBottom: `2px solid ${tab === k ? 'var(--accent)' : 'transparent'}`,
            marginBottom: -1, fontFamily: 'inherit',
          }}>{lbl}</button>
        ))}
      </div>

      {tab === 'hash' ? (
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Block Hash</label>
          <input style={input} value={blockHash} onChange={e => setBlockHash(e.target.value)} placeholder="Enter block hash..." />
          {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>{error}</div>}
          <button onClick={verifyByHash} disabled={loading} style={{ marginTop: 12, padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      ) : (
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Content</label>
          <textarea style={{ ...input, minHeight: 120, resize: 'vertical' }} value={content} onChange={e => setContent(e.target.value)} placeholder="Paste the content to check for a disclosure record..." />
          {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>{error}</div>}
          <button onClick={verifyByContent} disabled={loading} style={{ marginTop: 12, padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Searching...' : 'Check content'}
          </button>
        </div>
      )}

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
                    <div key={k} style={{ background: 'var(--surface)', borderRadius: 4, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 12 }}>{String(v)}</div>
                    </div>
                  ))}
                </div>
                {d.aiUsageDetails && (
                  <div style={{ marginTop: 8, background: 'var(--surface)', borderRadius: 4, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>AI Usage Details</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}>{d.aiUsageDetails}</div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {result && result.type === 'content' && (
        <div style={{ marginTop: 32, border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            {result.data.found ? `${result.data.disclosures.length} disclosure(s) found` : 'No disclosures found'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20, wordBreak: 'break-all' }}>
            Content hash: {result.data.contentHash}
          </div>
          {result.data.disclosures?.map((disc, i) => (
            <div key={i} style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Block #{disc.blockIndex}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['Title', disc.disclosure?.title], ['Author', disc.disclosure?.author], ['AI Used', disc.disclosure?.aiUsed ? 'Yes' : 'No'], ['Hash', disc.blockHash?.slice(0, 16) + '...']].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--surface)', borderRadius: 4, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 12 }}>{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
