import React, { useState, useEffect, useCallback } from 'react';
import { getDisclosures } from '../utils/api';
import DisclosureCard from '../components/DisclosureCard';

const s = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' },
  header: { marginBottom: 36 },
  title: { fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 },
  sub: { fontSize: 15, color: 'var(--text2)' },
  controls: {
    display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center',
  },
  search: {
    flex: 1, minWidth: 240, padding: '9px 14px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14,
    fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color 0.15s',
  },
  filterBtn: {
    padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    background: 'transparent', color: 'var(--text2)', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
  },
  filterActive: { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(0,229,255,0.06)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 },
  pagination: { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  pageBtn: {
    padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    background: 'transparent', color: 'var(--text2)', fontSize: 13, cursor: 'pointer',
    fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
  },
  pageActive: { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(0,229,255,0.08)' },
  empty: { gridColumn: '1/-1', textAlign: 'center', padding: '60px 24px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' },
  count: { fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--font-mono)', padding: '8px 0' },
  loading: { textAlign: 'center', padding: '80px 24px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 14 },
};

export default function Explorer() {
  const [disclosures, setDisclosures] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const LIMIT = 9;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, search: search || undefined };
      if (filter === 'ai') params.aiUsed = 'true';
      if (filter === 'human') params.aiUsed = 'false';
      const data = await getDisclosures(params);
      setDisclosures(data.disclosures || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(1); }, [search, filter]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'ai', label: '🤖 AI Used' },
    { key: 'human', label: '✍️ Human Only' },
  ];

  return (
    <div style={s.page} className="animate-in">
      <div style={s.header}>
        <div style={s.title}>Blockchain Explorer</div>
        <p style={s.sub}>Browse all recorded AI content disclosures</p>
      </div>

      <div style={s.controls}>
        <input
          style={s.search}
          placeholder="Search by title, author, or hash..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        {filters.map(f => (
          <button key={f.key} style={{ ...s.filterBtn, ...(filter === f.key ? s.filterActive : {}) }}
            onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
        <span style={s.count}>{total} records</span>
      </div>

      {loading ? (
        <div style={s.loading}>◌ Loading chain data...</div>
      ) : (
        <div style={s.grid}>
          {disclosures.length === 0 ? (
            <div style={s.empty}>No disclosures found</div>
          ) : (
            disclosures.map((item, i) => (
              <DisclosureCard key={item.blockHash || i} item={item} />
            ))
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button style={s.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, i, arr) => (
              <React.Fragment key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: 'var(--text3)' }}>…</span>}
                <button style={{ ...s.pageBtn, ...(p === page ? s.pageActive : {}) }} onClick={() => setPage(p)}>{p}</button>
              </React.Fragment>
            ))}
          <button style={s.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
