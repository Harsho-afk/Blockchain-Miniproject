import React, { useState, useEffect, useCallback } from 'react';
import { getDisclosures } from '../utils/api';
import DisclosureCard from '../components/DisclosureCard';

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
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
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

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Explorer</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>Browse all recorded AI content disclosures.</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{
            flex: 1, minWidth: 200, padding: '7px 12px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            color: 'var(--text)', background: 'var(--bg)', fontSize: 13,
            outline: 'none', fontFamily: 'inherit',
          }}
          placeholder="Search by title, author, or hash..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {[['all', 'All'], ['ai', 'AI Used'], ['human', 'Human Only']].map(([k, lbl]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: '7px 14px',
            border: `1px solid ${filter === k ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            background: filter === k ? '#eff6ff' : 'var(--bg)',
            color: filter === k ? 'var(--accent)' : 'var(--text2)',
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: filter === k ? 600 : 400,
          }}>{lbl}</button>
        ))}
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{total} records</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Loading...</div>
      ) : disclosures.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>No disclosures found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {disclosures.map((item, i) => (
            <DisclosureCard key={item.blockHash || i} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 32 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, i, arr) => (
            <React.Fragment key={p}>
              {i > 0 && arr[i - 1] !== p - 1 && <span style={{ padding: '6px 4px', color: 'var(--text3)' }}>…</span>}
              <button onClick={() => setPage(p)} style={{ padding: '6px 12px', border: `1px solid ${p === page ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: p === page ? '#eff6ff' : 'var(--bg)', color: p === page ? 'var(--accent)' : 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: p === page ? 600 : 400 }}>{p}</button>
            </React.Fragment>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
