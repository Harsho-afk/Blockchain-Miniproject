import React, { useState } from 'react';
import { createDisclosure } from '../utils/api';

const AI_TOOLS = [
  'ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Midjourney',
  'DALL-E', 'Stable Diffusion', 'Runway', 'ElevenLabs',
  'Perplexity', 'Jasper', 'Other'
];

const CONTENT_TYPES = ['article', 'blog post', 'code', 'image', 'video', 'audio', 'report', 'social post', 'other'];

const s = {
  page: { maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' },
  header: { marginBottom: 40 },
  back: { fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--font-mono)', textDecoration: 'none', display: 'block', marginBottom: 16 },
  title: { fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 },
  sub: { fontSize: 15, color: 'var(--text2)', lineHeight: 1.6 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 36px', marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 20 },
  field: { marginBottom: 24 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, fontFamily: 'var(--font-sans)' },
  input: {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14,
    fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color 0.15s',
  },
  textarea: {
    width: '100%', padding: '10px 14px', minHeight: 100, resize: 'vertical',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14,
    fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color 0.15s',
  },
  select: {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14,
    fontFamily: 'var(--font-sans)', outline: 'none',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  toggleGroup: { display: 'flex', gap: 12 },
  toggle: {
    flex: 1, padding: '14px 20px', borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--border)', background: 'transparent',
    color: 'var(--text2)', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  toggleSub: { fontSize: 11, fontWeight: 400, color: 'var(--text3)', fontFamily: 'var(--font-mono)' },
  toolsGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  toolChip: {
    padding: '6px 14px', borderRadius: 20,
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text2)', fontSize: 12, cursor: 'pointer',
    transition: 'all 0.15s', fontFamily: 'var(--font-mono)',
  },
  sliderWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  sliderRow: { display: 'flex', alignItems: 'center', gap: 12 },
  slider: { flex: 1, accentColor: 'var(--accent2)' },
  sliderVal: { fontSize: 14, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', width: 36, textAlign: 'right' },
  submitBtn: {
    width: '100%', padding: '16px', border: 'none', borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
    color: '#000', fontSize: 16, fontWeight: 800, cursor: 'pointer',
    fontFamily: 'var(--font-sans)', transition: 'opacity 0.15s', letterSpacing: '-0.01em',
  },
  error: { color: 'var(--red)', fontSize: 13, fontFamily: 'var(--font-mono)', marginTop: 8 },
  successBox: {
    background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.3)',
    borderRadius: 'var(--radius-lg)', padding: '32px 36px', textAlign: 'center',
  },
  successTitle: { fontSize: 24, fontWeight: 800, color: 'var(--green)', marginBottom: 12 },
  successSub: { fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 },
  hashBox: {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12,
    color: 'var(--accent)', wordBreak: 'break-all', textAlign: 'left', marginBottom: 8,
  },
  hashLabel: { fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 4 },
  newBtn: {
    marginTop: 20, padding: '10px 24px', background: 'transparent',
    border: '1px solid var(--border2)', borderRadius: 8,
    color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
};

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

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleTool = (tool) => {
    set('aiTools', form.aiTools.includes(tool)
      ? form.aiTools.filter(t => t !== tool)
      : [...form.aiTools, tool]);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title.trim()) return setError('Title is required');
    if (form.aiUsed === null) return setError('Please select whether AI was used');
    if (form.aiUsed && form.aiTools.length === 0) return setError('Please select at least one AI tool');

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
      <div style={s.page} className="animate-in">
        <div style={s.successBox}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⛓✓</div>
          <div style={s.successTitle}>Disclosure Recorded!</div>
          <p style={s.successSub}>
            Your AI usage disclosure has been permanently recorded on the blockchain.<br />
            It cannot be altered or deleted.
          </p>
          <div style={s.hashLabel}>Block Hash</div>
          <div style={s.hashBox}>{result.blockHash}</div>
          <div style={s.hashLabel}>Content Hash</div>
          <div style={s.hashBox}>{result.contentHash}</div>
          <div style={s.hashLabel}>Block Index</div>
          <div style={s.hashBox}>#{result.blockIndex}</div>
          <button style={s.newBtn} onClick={() => { setResult(null); setForm({ title: '', author: '', content: '', contentType: 'article', description: '', aiUsed: null, aiTools: [], aiPercentage: 50, humanEditPercentage: 50, aiUsageDetails: '', license: 'CC BY 4.0' }); }}>
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page} className="animate-in">
      <div style={s.header}>
        <div style={s.title}>Submit Disclosure</div>
        <p style={s.sub}>Permanently record AI usage in your content on the blockchain.</p>
      </div>

      {/* Content Info */}
      <div style={s.card}>
        <div style={s.sectionTitle}>01 — Content Information</div>

        <div style={s.field}>
          <label style={s.label}>Title *</label>
          <input style={s.input} value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Article, post, or project title"
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={s.row}>
          <div style={s.field}>
            <label style={s.label}>Author</label>
            <input style={s.input} value={form.author} onChange={e => set('author', e.target.value)}
              placeholder="Your name or alias"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Content Type</label>
            <select style={s.select} value={form.contentType} onChange={e => set('contentType', e.target.value)}>
              {CONTENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Content / Excerpt (used to generate hash)</label>
          <textarea style={s.textarea} value={form.content} onChange={e => set('content', e.target.value)}
            placeholder="Paste your content or a unique excerpt here. This generates a verifiable hash."
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Description</label>
          <input style={s.input} value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Short description of the content"
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* AI Usage */}
      <div style={s.card}>
        <div style={s.sectionTitle}>02 — AI Usage Declaration</div>

        <div style={{ ...s.field }}>
          <label style={s.label}>Was AI used in creating this content? *</label>
          <div style={s.toggleGroup}>
            <button
              style={{ ...s.toggle, ...(form.aiUsed === true ? { borderColor: 'var(--accent2)', color: 'var(--text)', background: 'rgba(0,119,255,0.1)' } : {}) }}
              onClick={() => set('aiUsed', true)}
            >
              🤖 Yes, AI was used
              <span style={s.toggleSub}>AI tools assisted in creation</span>
            </button>
            <button
              style={{ ...s.toggle, ...(form.aiUsed === false ? { borderColor: 'var(--green)', color: 'var(--text)', background: 'rgba(0,255,136,0.08)' } : {}) }}
              onClick={() => set('aiUsed', false)}
            >
              ✍️ No AI used
              <span style={s.toggleSub}>100% human-created</span>
            </button>
          </div>
        </div>

        {form.aiUsed === true && (
          <>
            <div style={s.field}>
              <label style={s.label}>AI Tools Used *</label>
              <div style={s.toolsGrid}>
                {AI_TOOLS.map(tool => (
                  <button key={tool} style={{
                    ...s.toolChip,
                    ...(form.aiTools.includes(tool) ? { borderColor: 'var(--accent2)', color: 'var(--accent)', background: 'rgba(0,119,255,0.08)' } : {})
                  }} onClick={() => toggleTool(tool)}>
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>AI Contribution %</label>
                <div style={s.sliderWrap}>
                  <div style={s.sliderRow}>
                    <input type="range" min="0" max="100" style={s.slider}
                      value={form.aiPercentage} onChange={e => set('aiPercentage', Number(e.target.value))} />
                    <span style={s.sliderVal}>{form.aiPercentage}%</span>
                  </div>
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Human Edit %</label>
                <div style={s.sliderWrap}>
                  <div style={s.sliderRow}>
                    <input type="range" min="0" max="100" style={s.slider}
                      value={form.humanEditPercentage} onChange={e => set('humanEditPercentage', Number(e.target.value))} />
                    <span style={s.sliderVal}>{form.humanEditPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>AI Usage Details</label>
              <textarea style={s.textarea} value={form.aiUsageDetails} onChange={e => set('aiUsageDetails', e.target.value)}
                placeholder="Describe how AI was used (e.g., 'Used GPT-4 for first draft, Claude for editing, DALL-E for images')"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </>
        )}
      </div>

      {/* License */}
      <div style={s.card}>
        <div style={s.sectionTitle}>03 — License</div>
        <div style={s.field}>
          <label style={s.label}>Content License</label>
          <select style={s.select} value={form.license} onChange={e => set('license', e.target.value)}>
            {['All Rights Reserved', 'CC BY 4.0', 'CC BY-SA 4.0', 'CC BY-NC 4.0', 'CC0 (Public Domain)', 'MIT', 'Apache 2.0'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div style={s.error}>⚠ {error}</div>}

      <button style={{ ...s.submitBtn, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>
        {loading ? '⏳ Mining block...' : '⛓ Record on Blockchain'}
      </button>
    </div>
  );
}
