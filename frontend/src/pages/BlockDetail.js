import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDisclosure, verifyBlock } from '../utils/api';

const panel = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  padding: '24px',
};

const detailBox = {
  background: 'var(--surface-2)',
  borderRadius: 4,
  padding: '8px 12px',
};

export default function BlockDetail() {
  const { blockHash } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await verifyBlock(blockHash);
        if (!active) return;
        setResult(data);
        if (data.block?.data?.disclosureId) {
          const disclosure = await getDisclosure(data.block.data.disclosureId);
          if (active) setHistory(disclosure.history || []);
        } else if (active) {
          setHistory([]);
        }
      } catch (e) {
        if (active) {
          setError(e.response?.data?.error || 'Failed to load block.');
          setResult(null);
          setHistory([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (blockHash) load();

    return () => {
      active = false;
    };
  }, [blockHash]);

  const d = result?.block?.data;

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Block Detail</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Browse the stored disclosure record directly.</p>
        </div>
        <Link to="/explorer" style={{ fontSize: 12, color: 'var(--accent)' }}>
          Back to explorer
        </Link>
      </div>

      {loading ? (
        <div style={{ ...panel, color: 'var(--text3)' }}>Loading block...</div>
      ) : error ? (
        <div style={{ ...panel, color: 'var(--red)' }}>{error}</div>
      ) : (
        <div style={panel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 20 }}>{result?.verified ? '✓' : '✗'}</span>
            <div>
              <div style={{ fontWeight: 700, color: result?.verified ? 'var(--green)' : 'var(--red)' }}>
                {result?.verified ? 'Block Verified' : 'Verification Failed'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                {result?.verified ? 'Authentic and readable from the chain.' : 'This block could not be verified.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              ['Title', d?.title],
              ['Author', d?.author],
              ['Disclosure ID', d?.disclosureId],
              ['Version', d?.version || 1],
              ['AI Used', d?.aiUsed ? 'Yes' : 'No'],
              ['Tools', d?.aiTools?.join(', ') || 'None'],
              ['AI %', d?.aiUsed ? `${d.aiPercentage}%` : 'N/A'],
              ['License', d?.license],
              ['Block #', result?.block?.index],
              ['Submitted', d?.submittedAt ? new Date(d.submittedAt).toLocaleString() : '—'],
            ].map(([k, v]) => (
              <div key={k} style={detailBox}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 12, wordBreak: 'break-word' }}>{String(v)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>Block Hash</div>
            <div style={{ ...detailBox, wordBreak: 'break-all' }}>{result?.block?.hash}</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>Previous Hash</div>
            <div style={{ ...detailBox, wordBreak: 'break-all' }}>{result?.block?.previousHash}</div>
          </div>

          {d?.aiUsageDetails && (
            <div style={{ marginBottom: 20, ...detailBox }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>AI Usage Details</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{d.aiUsageDetails}</div>
            </div>
          )}

          {(d?.content || d?.description) && (
            <div style={{ ...detailBox, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>Stored Content</div>
              <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {d?.content || d?.description}
              </div>
            </div>
          )}

          {d?.disclosureId && (
            <div style={{ marginBottom: 20 }}>
              <Link to={`/submit?edit=${d.disclosureId}&block=${blockHash}`} style={{ fontSize: 12, color: 'var(--accent)' }}>
                Create new version
              </Link>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 12 }}>
                Version History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.map((entry) => (
                  <div key={entry.blockHash} style={{ ...detailBox, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 12 }}>Version {entry.disclosure?.version || 1}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                        Block #{entry.blockIndex} · {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Link to={`/blocks/${entry.blockHash}`} style={{ fontSize: 12, color: 'var(--accent)' }}>
                      View version
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
