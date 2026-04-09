import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getDisclosures } from '../utils/api';
import StatCard from '../components/StatCard';
import DisclosureCard from '../components/DisclosureCard';
import ChainVisualizer from '../components/ChainVisualizer';

const page = { maxWidth: 960, margin: '0 auto', padding: '40px 24px' };
const section = { marginBottom: 40 };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 };
const sectionTitle = { fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [disclosures, setDisclosures] = useState([]);
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, d, c] = await Promise.all([
        getStats(),
        getDisclosures({ limit: 6 }),
        fetch('http://localhost:3001/api/chain').then(r => r.json()),
      ]);
      setStats(s);
      setDisclosures(d.disclosures || []);
      setChain(c.chain || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div style={{ ...page, color: 'var(--text3)' }}>Loading...</div>;
  }

  return (
    <div style={page}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>AI Content Disclosure</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Declare and verify AI usage in digital content — permanently recorded on-chain.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Link to="/submit" style={{
            padding: '8px 16px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 'var(--radius)',
            fontSize: 13,
            fontWeight: 600,
          }}>
            Submit disclosure
          </Link>
          <Link to="/verify" style={{
            padding: '8px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: 13,
            color: 'var(--text)',
            background: 'var(--surface)',
          }}>
            Verify content
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ ...section }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}>
          <StatCard label="Total Blocks" value={stats?.totalBlocks ?? 0} sub="incl. genesis" />
          <StatCard label="Disclosures" value={stats?.totalDisclosures ?? 0} sub="on chain" />
          <StatCard label="AI Declared" value={stats?.aiUsedCount ?? 0} sub="content with AI" />
          <StatCard label="Human Only" value={stats?.humanOnlyCount ?? 0} sub="no AI" />
          <StatCard
            label="Chain Valid"
            value={stats?.chainValid ? 'Yes' : 'No'}
            sub="integrity check"
          />
        </div>
      </div>

      {/* Chain */}
      <div style={section}>
        <div style={sectionHeader}>
          <span style={sectionTitle}>Live Chain</span>
          <Link to="/explorer" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
        </div>
        <ChainVisualizer chain={chain} />
      </div>

      {/* Recent */}
      <div style={section}>
        <div style={sectionHeader}>
          <span style={sectionTitle}>Recent Disclosures</span>
          <Link to="/explorer" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
        </div>
        {disclosures.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            No disclosures yet.
          </div>
        ) : (
          <div style={grid}>
            {disclosures.map((item, i) => (
              <DisclosureCard key={item.blockHash || i} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={section}>
        <div style={{ ...sectionHeader, marginBottom: 16 }}>
          <span style={sectionTitle}>How It Works</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            ['01 Declare', 'Creator states whether AI was used, which tools, and how much human editing was done.'],
            ['02 Hash', 'Content is hashed with SHA-256, creating a tamper-proof fingerprint.'],
            ['03 Mine', 'A block is mined with proof-of-work and linked to the chain.'],
            ['04 Verify', 'Anyone can verify using the block hash or by hashing the original content.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', background: 'var(--surface)' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
