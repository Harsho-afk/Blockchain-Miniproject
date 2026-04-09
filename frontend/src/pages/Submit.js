import React, { useState, useRef, useCallback } from 'react';
import { createDisclosure } from '../utils/api';

const AI_TOOLS = ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Perplexity', 'Jasper', 'Other'];
const CONTENT_TYPES = ['article', 'blog post', 'code', 'image', 'video', 'audio', 'report', 'social post', 'other'];
const LICENSES = ['All Rights Reserved', 'CC BY 4.0', 'CC BY-SA 4.0', 'CC BY-NC 4.0', 'CC0 (Public Domain)', 'MIT', 'Apache 2.0'];

const TEXT_EXTRACTABLE = ['text/plain', 'text/markdown', 'text/csv', 'text/html', 'application/json', 'application/xml', 'text/xml'];

const input = {
  width: '100%', padding: '8px 12px',
  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  color: 'var(--text)', background: 'var(--bg)', fontSize: 14,
  outline: 'none', fontFamily: 'inherit',
};

const label = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 };
const field = { marginBottom: 20 };

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileDropZone({ files, onFiles, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) onFiles(dropped);
  }, [onFiles]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleInputChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length) onFiles(selected);
    e.target.value = '';
  };

  return (
    <div style={field}>
      <label style={label}>Attach Files <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(optional)</span></label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current.click()}
        style={{
          border: `1px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          background: dragging ? '#eff6ff' : 'var(--surface)',
          padding: '24px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 6 }}>↑</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          Drop files here or <span style={{ color: 'var(--accent)', fontWeight: 600 }}>browse</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
          Any file type — text content will be auto-extracted
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {files.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg)',
              fontSize: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <span style={{ fontSize: 16 }}>{getFileIcon(f.type)}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>{f.name}</span>
                <span style={{ color: 'var(--text3)', flexShrink: 0 }}>{formatBytes(f.size)}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text3)', fontSize: 16, lineHeight: 1,
                  padding: '0 4px', flexShrink: 0,
                }}
                title="Remove"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getFileIcon(mimeType = '') {
  if (mimeType.startsWith('image/')) return '🖼';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜';
  if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml')) return '📝';
  return '📁';
}

async function extractTextFromFiles(files) {
  const results = [];
  for (const file of files) {
    const isText = TEXT_EXTRACTABLE.some(t => file.type === t) || file.name.match(/\.(txt|md|csv|json|xml|html|js|ts|py|java|cpp|c|cs|go|rb|php|swift|kt|rs|sh|yaml|yml|toml|ini|env|log)$/i);
    if (isText) {
      try {
        const text = await file.text();
        results.push(`[${file.name}]\n${text.slice(0, 2000)}${text.length > 2000 ? '\n...(truncated)' : ''}`);
      } catch {}
    }
  }
  return results.join('\n\n---\n\n');
}

export default function Submit() {
  const [form, setForm] = useState({
    title: '', author: '', content: '', contentType: 'article',
    description: '', aiUsed: null, aiTools: [],
    aiPercentage: 50, humanEditPercentage: 50,
    aiUsageDetails: '', license: 'CC BY 4.0',
  });
  const [files, setFiles] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleTool = (t) => set('aiTools', form.aiTools.includes(t) ? form.aiTools.filter(x => x !== t) : [...form.aiTools, t]);

  const handleFiles = useCallback(async (newFiles) => {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      const unique = newFiles.filter(f => !existing.has(f.name + f.size));
      return [...prev, ...unique];
    });

    // Auto-fill title from first file if title is empty
    if (!form.title && newFiles[0]) {
      const name = newFiles[0].name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      set('title', name.charAt(0).toUpperCase() + name.slice(1));
    }

    // Extract text content from text-based files
    setExtracting(true);
    try {
      const extracted = await extractTextFromFiles(newFiles);
      if (extracted) {
        set('content', prev => prev ? prev + '\n\n' + extracted : extracted);
      }
    } finally {
      setExtracting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title.trim()) return setError('Title is required.');
    if (form.aiUsed === null) return setError('Please declare whether AI was used.');
    if (form.aiUsed && form.aiTools.length === 0) return setError('Select at least one AI tool.');
    setLoading(true);
    try {
      const payload = {
        ...form,
        attachedFiles: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      };
      const res = await createDisclosure(payload);
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
          {files.length > 0 && (
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
              {files.length} file{files.length > 1 ? 's' : ''} referenced in this disclosure.
            </div>
          )}
          <button
            onClick={() => {
              setResult(null);
              setFiles([]);
              setForm({ title: '', author: '', content: '', contentType: 'article', description: '', aiUsed: null, aiTools: [], aiPercentage: 50, humanEditPercentage: 50, aiUsageDetails: '', license: 'CC BY 4.0' });
            }}
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

      {/* File Drop */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 16 }}>Files</div>
        <FileDropZone files={files} onFiles={handleFiles} onRemove={removeFile} />
        {extracting && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Extracting text content...</div>
        )}
      </div>

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
          <label style={label}>
            Content / Excerpt
            {extracting && <span style={{ fontWeight: 400, color: 'var(--text3)', marginLeft: 8 }}>extracting...</span>}
          </label>
          <textarea style={{ ...input, minHeight: 100, resize: 'vertical' }} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Paste content or a unique excerpt — auto-populated from text files above." />
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
        {loading ? 'Mining block...' : `Record on blockchain${files.length ? ` · ${files.length} file${files.length > 1 ? 's' : ''}` : ''}`}
      </button>
    </div>
  );
}
