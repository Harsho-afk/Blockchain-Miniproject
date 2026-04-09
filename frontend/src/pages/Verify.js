import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyBlock, verifyContent } from '../utils/api';

const s = {
  page: { maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' },
  title: { fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 },
  sub: { fontSize: 15, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 40 },
  tabs: { display: 'flex', gap: 0, marginBottom: 32, borderBottom: '1px solid var(--border)' },
  tab: {
    padding: '10px 24px', border: 'none', background: 'transparent',
    color: 'var(--text3)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-sans)', borderBottom: '2px solid transparent',
    marginBottom: -1, transition: 'all 0.15s',
  },
  tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 32px' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 },
  input: {
    width: '100%', padding: '11px 14px',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 13,
    fontFamily: 'var(--font-mono)', outline: 'none', transition: 'border-color 0.15s',
  },
  textarea: {
    width: '100%', padding: '11px 14px', minHeight: 140, resize: 'vertical',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14,
    fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color 0.15s',
  },
  btn: {
    marginTop: 16, padding: '11px 24px', border: 'none',
    background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
    borderRadius: 'var(--radius)', color: '#000', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'var(--font-sans)',
  },
  result: { marginTop: 28 },
  resultTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 16 },
  statusBox: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
    borderRadius: 'var(--radius-lg)', marginBottom: 20,
  },
  statusIcon: { fontSize: 32 },
  statusTitle: { fontSize: 18, fontWeight: 800 },
  statusSub: { fontSize: 13, color: 'var(--text2)', marginTop: 2 },
  checks: { display: 'flex', flexDirection: 'column', gap: 12 },
  check: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg2)', borderRadius: 8 },
  checkIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  checkLabel: { fontSize: 13, color: 'var(--text2)', flex: 1 },
  checkVal: { fontSize: 12, fontFamily: 'var(--font-mono)' },
  dataSection: { marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 },
  dataTitle: { fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 12 },
  dataGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  dataItem: { background: 'var(--bg2)', borderRadius: 8, padding: '10px 14px' },
  dataKey: { fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 4 },
  dataVal: { fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px',
    borderRadius: 12, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
  },
};

function CheckItem({ label, pass, value }) {
  return (
    <div style={s.check}>
      <span style={s.checkIcon}>{pass ? '✓' : '✗'}</span>
      <span style={s.checkLabel}>{label}</span>
      {value && <span style={{ ...s.checkVal, color: pass ? 'var(--green)' : 'var(--red)' }}>{value}</span>}
    </div>
  );
}

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
    if (!blockHash.trim()) return setError('Enter a block hash');
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await verifyBlock(blockHash.trim());
      setResult({ type: 'hash', data: res });
    } catch (e) {
      setError(e.response?.data?.error || 'Verification failed');
    } finally { setLoading(false); }
  };

  const verifyByContent = async () => {
    if (!content.trim()) return setError('Enter content to verify');
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await verifyContent(content.trim());
      setResult({ type: 'content', data: res });
    } catch (e) {
      setError(e.response?.data?.error || 'Verification failed');
    } finally { setLoading(false); }
  };

  const renderHashResult = (data) => {
    const ok = data.verified;
    const d = data.block?.data;
    return (
      <div style={s.result}>
        <div style={s.resultTitle}>Verification Result</div>
        <div style={{
          ...s.statusBox,
          background: ok ? 'rgba(0,255,136,0.06)' : 'rgba(255,59,92,0.06)',
          border: `1px solid ${ok ? 'rgba(0,255,136,0.3)' : 'rgba(255,59,92,0.3)'}`,
        }}>
          <span style={s.statusIcon}>{ok ? '✅' : '❌'}</span>
          <div>
            <div style={{ ...s.statusTitle, color: ok ? 'var(--green)' : 'var(--red)' }}>
              {ok ? 'Block Verified' : 'Verification Failed'}
            </div>
            <div style={s.statusSub}>
              {ok ? 'This disclosure is authentic and unaltered on the blockchain' : 'Could not verify this block'}
            </div>
          </div>
        </div>

        <div style={s.checks}>
          <CheckItem label="Block found on chain" pass={data.blockFound} value={data.blockFound ? 'found' : 'not found'} />
          <CheckItem label="Hash integrity" pass={data.hashIntegrity} value={data.hashIntegrity ? 'intact' : 'tampered'} />
          <CheckItem label="Chain integrity" pass={data.chainIntegrity} value={data.chainIntegrity ? 'valid' : 'broken'} />
        </div>

        {d && (
          <div style={s.dataSection}>
            <div style={s.dataTitle}>Disclosure Details</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ ...s.badge, background: d.aiUsed ? 'rgba(0,119,255,0.12)' : 'rgba(0,255,136,0.08)', color: d.aiUsed ? 'var(--accent2)' : 'var(--green)', border: `1px solid ${d.aiUsed ? 'rgba(0,119,255,0.3)' : 'rgba(0,255,136,0.2)'}` }}>
                {d.aiUsed ? '🤖 AI Used' : '✍️ Human Only'}
              </span>
              {d.contentType && <span style={{ ...s.badge, background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>{d.contentType}</span>}
            </div>
            <div style={s.dataGrid}>
              {[
                ['Title', d.title], ['Author', d.author],
                ['AI Tools', d.aiTools?.join(', ') || 'None'],
                ['AI %', d.aiUsed ? `${d.aiPercentage}%` : 'N/A'],
                ['License', d.license],
                ['Block #', data.block?.index],
                ['Content Hash', d.contentHash?.slice(0, 24) + '...'],
                ['Submitted', d.submittedAt ? new Date(d.submittedAt).toLocaleString() : '—'],
              ].map(([k, v]) => v != null && (
                <div key={k} style={s.dataItem}>
                  <div style={s.dataKey}>{k}</div>
                  <div style={s.dataVal}>{String(v)}</div>
                </div>
              ))}
            </div>
            {d.aiUsageDetails && (
              <div style={{ marginTop: 12, ...s.dataItem }}>
                <div style={s.dataKey}>AI Usage Details</div>
                <div style={{ ...s.dataVal, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5 }}>{d.aiUsageDetails}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContentResult = (data) => {
    const found = data.found;
    return (
      <div style={s.result}>
        <div style={s.resultTitle}>Content Lookup</div>
        <div style={{
          ...s.statusBox,
          background: found ? 'rgba(0,229,255,0.05)' : 'rgba(100,100,150,0.05)',
          border: `1px solid ${found ? 'rgba(0,229,255,0.25)' : 'var(--border)'}`,
        }}>
          <span style={s.statusIcon}>{found ? '🔍' : '🕵️'}</span>
          <div>
            <div style={{ ...s.statusTitle, color: found ? 'var(--accent)' : 'var(--text2)' }}>
              {found ? `${data.disclosures.length} Disclosure(s) Found` : 'No Disclosures Found'}
            </div>
            <div style={s.statusSub}>Content hash: {data.contentHash?.slice(0, 32)}...</div>
          </div>
        </div>

        {found && data.disclosures.map((disc, i) => (
          <div key={i} style={{ ...s.dataSection, marginTop: i === 0 ? 24 : 0 }}>
            <div style={s.dataTitle}>Disclosure #{i + 1} — Block {disc.blockIndex}</div>
            <div style={s.dataGrid}>
              {[
                ['Title', disc.disclosure?.title],
                ['Author', disc.disclosure?.author],
                ['AI Used', disc.disclosure?.aiUsed ? 'Yes' : 'No'],
                ['Block Hash', disc.blockHash?.slice(0, 20) + '...'],
              ].map(([k, v]) => v != null && (
                <div key={k} style={s.dataItem}>
                  <div style={s.dataKey}>{k}</div>
                  <div style={s.dataVal}>{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={s.page} className="animate-in">
      <div style={s.title}>Verify Disclosure</div>
      <p style={s.sub}>Check any disclosure's authenticity on the blockchain. Verifications are cryptographically guaranteed.</p>

      <div style={s.tabs}>
        {[['hash', 'By Block Hash'], ['content', 'By Content']].map(([key, label]) => (
          <button key={key} style={{ ...s.tab, ...(tab === key ? s.tabActive : {}) }} onClick={() => { setTab(key); setResult(null); setError(''); }}>
            {label}
          </button>
        ))}
      </div>

      <div style={s.card}>
        {tab === 'hash' ? (
          <>
            <label style={s.label}>Block Hash</label>
            <input style={s.input} value={blockHash} onChange={e => setBlockHash(e.target.value)}
              placeholder="Enter the block hash to verify..."
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {error && <div style={{ color: 'var(--red)', fontSize: 13, fontFamily: 'var(--font-mono)', marginTop: 8 }}>⚠ {error}</div>}
            <button style={s.btn} onClick={verifyByHash} disabled={loading}>
              {loading ? '⏳ Verifying...' : '🔍 Verify Block'}
            </button>
          </>
        ) : (
          <>
            <label style={s.label}>Content to Verify</label>
            <textarea style={s.textarea} value={content} onChange={e => setContent(e.target.value)}
              placeholder="Paste the content or excerpt to check if it has a disclosure record..."
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {error && <div style={{ color: 'var(--red)', fontSize: 13, fontFamily: 'var(--font-mono)', marginTop: 8 }}>⚠ {error}</div>}
            <button style={s.btn} onClick={verifyByContent} disabled={loading}>
              {loading ? '⏳ Searching...' : '🔍 Check Content'}
            </button>
          </>
        )}

        {result && (
          result.type === 'hash' ? renderHashResult(result.data) : renderContentResult(result.data)
        )}
      </div>
    </div>
  );
}
