import React, { useState } from 'react';
import { createDisclosure } from '../utils/api';

const AI_TOOLS = ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Perplexity', 'Jasper', 'Other'];
const CONTENT_TYPES = ['article', 'blog post', 'code', 'image', 'video', 'audio', 'report', 'social post', 'other'];
const LICENSES = ['All Rights Reserved', 'CC BY 4.0', 'CC BY-SA 4.0', 'CC BY-NC 4.0', 'CC0 (Public Domain)', 'MIT', 'Apache 2.0'];

const input = {
  width: '100%', padding: '8px 12px',
  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  color: 'var(--text)', background: 'var(--bg)', fontSize: 14,
  outline: 'none', fontFamily: 'inherit',
};

const label = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 };
const field = { marginBottom: 20 };

export default function Submit() {
  const [form, setForm] = useState({
    title: '', author: '', content: '', contentType: 'article',
    description: '', aiUsed: null, aiTools: [],
    aiPercentage: 50, humanEditPercentage: 50,
    aiUsageDetails: '', license: 'CC BY 4.0',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleTool = (t) => set('aiTools', form.aiTools.includes(t) ? form.aiTools.filter(x => x !== t) : [...form.aiTools, t]);

  const handleSubmit = async () => {
    setError('');
    if (!form.title.trim()) return setError('Title is required.');
    if (form.aiUsed === null) return setError('Please declare whether AI was used.');
    if (form.aiUsed && form.aiTools.length === 0) return setError('Select at least one AI tool.');
    setLoading(true);
    try {
      const res = await createDisclosure(form);
      setResult(res);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to submit. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--green)' }}>
            ✓ Recorded on blockchain
          </div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>
            Your disclosure is permanently stored. It cannot be altered or deleted.
          </p>
          {[
            ['Block Hash', result.blockHash],
            ['Content Hash', result.contentHash],
            ['Block #', `#${result.blockIndex}`],
          ].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{k}</div>
              <div style={{ fontFamily: 'inherit', fontSize: 12, background: 'var(--surface)', padding: '8px 12px', borderRadius: 'var(--radius)', wordBreak: 'break-all', border: '1px solid var(--border)' }}>
                {v}
              </div>
            </div>
          ))}
          <button onClick={() => { setResult(null); setForm({ title: '', author: '', content: '', contentType: 'article', description: '', aiUsed: null, aiTools: [], aiPercentage: 50, humanEditPercentage: 50, aiUsageDetails: '', license: 'CC BY 4.0' }); }}
            style={{ marginTop: 16, padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Submit Disclosure</h1>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 32 }}>Record AI usage permanently on the blockchain.</p>

      {/* Content info */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 16 }}>Content</div>

        <div style={field}>
          <label style={label}>Title *</label>
          <input style={input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Article, post, or project title" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={field}>
            <label style={label}>Author</label>
            <input style={input} value={form.author} onChange={e => set('author', e.target.value)} placeholder="Your name" />
          </div>
          <div style={field}>
            <label style={label}>Content Type</label>
            <select style={input} value={form.contentType} onChange={e => set('contentType', e.target.value)}>
              {CONTENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div style={field}>
          <label style={label}>Content / Excerpt</label>
          <textarea style={{ ...input, minHeight: 100, resize: 'vertical' }} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Paste content or a unique excerpt — used to generate a content hash." />
        </div>

        <div style={field}>
          <label style={label}>Description</label>
          <input style={input} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description" />
        </div>
      </div>

      {/* AI Declaration */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 16 }}>AI Usage</div>

        <div style={field}>
          <label style={label}>Was AI used? *</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['yes', true, 'Yes, AI was used'], ['no', false, 'No, human only']].map(([key, val, lbl]) => (
              <button key={key} onClick={() => set('aiUsed', val)} style={{
                flex: 1, padding: '10px 16px',
                border: `1px solid ${form.aiUsed === val ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                background: form.aiUsed === val ? '#eff6ff' : 'var(--bg)',
                color: form.aiUsed === val ? 'var(--accent)' : 'var(--text)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {form.aiUsed === true && (
          <>
            <div style={field}>
              <label style={label}>Tools Used *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {AI_TOOLS.map(t => (
                  <button key={t} onClick={() => toggleTool(t)} style={{
                    padding: '4px 10px',
                    border: `1px solid ${form.aiTools.includes(t) ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 4,
                    background: form.aiTools.includes(t) ? '#eff6ff' : 'var(--bg)',
                    color: form.aiTools.includes(t) ? 'var(--accent)' : 'var(--text)',
                    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[['aiPercentage', 'AI Contribution %'], ['humanEditPercentage', 'Human Edit %']].map(([k, lbl]) => (
                <div key={k} style={field}>
                  <label style={label}>{lbl}: {form[k]}%</label>
                  <input type="range" min="0" max="100" value={form[k]} onChange={e => set(k, Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }} />
                </div>
              ))}
            </div>

            <div style={field}>
              <label style={label}>Details</label>
              <textarea style={{ ...input, minHeight: 80, resize: 'vertical' }} value={form.aiUsageDetails} onChange={e => set('aiUsageDetails', e.target.value)} placeholder="Describe how AI was used..." />
            </div>
          </>
        )}
      </div>

      {/* License */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 16 }}>License</div>
        <div style={field}>
          <label style={label}>Content License</label>
          <select style={input} value={form.license} onChange={e => set('license', e.target.value)}>
            {LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {error && <div style={{ fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>{error}</div>}

      <button onClick={handleSubmit} disabled={loading} style={{
        width: '100%', padding: '11px',
        background: loading ? 'var(--border)' : 'var(--accent)',
        border: 'none', borderRadius: 'var(--radius)',
        color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
      }}>
        {loading ? 'Mining block...' : 'Record on blockchain'}
      </button>
    </div>
  );
}
