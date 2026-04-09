import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getDisclosures } from '../utils/api';
import StatCard from '../components/StatCard';
import DisclosureCard from '../components/DisclosureCard';
import ChainVisualizer from '../components/ChainVisualizer';

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px' },
  hero: {
    textAlign: 'center',
    marginBottom: 56,
    padding: '60px 24px 40px',
  },
  heroTag: {
    display: 'inline-block',
    padding: '4px 14px',
    border: '1px solid rgba(0,229,255,0.3)',
    borderRadius: 20,
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 'clamp(36px, 6vw, 60px)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.05,
    color: 'var(--text)',
    marginBottom: 16,
    fontFamily: 'var(--font-sans)',
  },
  heroAccent: {
    background: 'linear-gradient(90deg, var(--accent2), var(--accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    fontSize: 17,
    color: 'var(--text2)',
    maxWidth: 520,
    margin: '0 auto 32px',
    lineHeight: 1.6,
  },
  heroBtns: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#000',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'var(--font-sans)',
    display: 'inline-block',
  },
  btnSecondary: {
    padding: '12px 28px',
    background: 'transparent',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'var(--font-sans)',
    display: 'inline-block',
  },
  section: { marginBottom: 52 },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
  },
  sectionLink: {
    fontSize: 13,
    color: 'var(--accent)',
    textDecoration: 'none',
    fontFamily: 'var(--font-mono)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 52,
  },
  disclosureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: 16,
  },
  empty: {
    textAlign: 'center',
    padding: '60px 24px',
    color: 'var(--text3)',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    background: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
  },
  validity: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    background: 'rgba(0,255,136,0.08)',
    color: 'var(--green)',
    border: '1px solid rgba(0,255,136,0.2)',
  },
  howGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  step: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
  },
  stepNum: {
    fontSize: 11,
    color: 'var(--text3)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.1em',
    marginBottom: 12,
  },
  stepIcon: { fontSize: 28, marginBottom: 10 },
  stepTitle: { fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text)' },
  stepDesc: { fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 },
  loading: {
    textAlign: 'center',
    padding: '120px 24px',
    color: 'var(--text3)',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
  },
};

const HOW_IT_WORKS = [
  { num: '01', icon: '✍️', title: 'Declare', desc: 'Creator declares whether AI was used, which tools, and how much human editing was involved.' },
  { num: '02', icon: '🔐', title: 'Hash', desc: 'Content is cryptographically hashed using SHA-256, creating a unique tamper-proof fingerprint.' },
  { num: '03', icon: '⛏️', title: 'Mine', desc: 'A new block is mined with proof-of-work and cryptographically linked to the previous block.' },
  { num: '04', icon: '✅', title: 'Verify', desc: 'Anyone can verify the disclosure anytime using the block hash or by hashing the original content.' },
];

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
    return (
      <div style={styles.loading}>
        <div>◌ Connecting to blockchain...</div>
      </div>
    );
  }

  return (
    <div style={styles.page} className="animate-in">

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroTag}>⛓ Powered by blockchain</div>
        <h1 style={styles.heroTitle}>
          AI Transparency,<br />
          <span style={styles.heroAccent}>Immutably Recorded</span>
        </h1>
        <p style={styles.heroSub}>
          Declare AI usage in your content. Store it permanently on the blockchain.
          Anyone can verify — no one can alter.
        </p>
        <div style={styles.heroBtns}>
          <Link to="/submit" style={styles.btnPrimary}>Submit Disclosure</Link>
          <Link to="/verify" style={styles.btnSecondary}>Verify Content</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard label="Total Blocks" value={stats?.totalBlocks ?? 0} icon="⛓" sub="Including genesis" accent="var(--accent)" />
        <StatCard label="Disclosures" value={stats?.totalDisclosures ?? 0} icon="📋" sub="Recorded on chain" accent="var(--accent2)" />
        <StatCard label="AI Declared" value={stats?.aiUsedCount ?? 0} icon="🤖" sub="Content with AI" accent="var(--accent3)" />
        <StatCard label="Human Only" value={stats?.humanOnlyCount ?? 0} icon="✍️" sub="No AI used" accent="var(--green)" />
        <StatCard
          label="Chain Valid"
          value={stats?.chainValid ? '✓' : '✗'}
          icon="🔒"
          sub="Integrity check"
          accent={stats?.chainValid ? 'var(--green)' : 'var(--red)'}
        />
      </div>

      {/* Chain Visualizer */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={styles.sectionTitle}>Live Chain</span>
            {stats?.chainValid && <span style={styles.validity}>● verified</span>}
          </div>
          <Link to="/explorer" style={styles.sectionLink}>view all →</Link>
        </div>
        <ChainVisualizer chain={chain} />
      </div>

      {/* Recent Disclosures */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Recent Disclosures</span>
          <Link to="/explorer" style={styles.sectionLink}>view all →</Link>
        </div>
        {disclosures.length === 0 ? (
          <div style={styles.empty}>
            No disclosures yet.<br />Be the first to submit one.
          </div>
        ) : (
          <div style={styles.disclosureGrid}>
            {disclosures.map((item, i) => (
              <DisclosureCard key={item.blockHash || i} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>How It Works</span>
        </div>
        <div style={styles.howGrid}>
          {HOW_IT_WORKS.map(({ num, icon, title, desc }) => (
            <div key={num} style={styles.step}>
              <div style={styles.stepNum}>{num}</div>
              <div style={styles.stepIcon}>{icon}</div>
              <div style={styles.stepTitle}>{title}</div>
              <div style={styles.stepDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
