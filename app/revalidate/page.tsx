'use client';

import { useState } from 'react';

const TAGS = ['posts', 'post-1', 'post-2', 'post-3', 'post-4', 'post-5'];

export default function RevalidatePage() {
  const [selected, setSelected] = useState('posts');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function handleRevalidate() {
    setStatus('loading');
    setResult(null);
    try {
      const res = await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: selected }),
      });
      const json = await res.json();
      setResult(json);
      setStatus(res.ok ? 'ok' : 'error');
    } catch (err) {
      setResult({ error: String(err) });
      setStatus('error');
    }
  }

  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>← All posts</a>

      <h1 style={styles.title}>Cache Management</h1>
      <p style={styles.desc}>
        Select a cache tag and click <strong>Revalidate</strong>. The next visit to a matching
        post will trigger a fresh server render — and reproduce the ISR write issue in the
        AppSail logs.
      </p>

      <div style={styles.card}>
        <label style={styles.label} htmlFor="tag-select">Cache tag to invalidate</label>
        <select
          id="tag-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={styles.select}
        >
          {TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <button
          onClick={handleRevalidate}
          disabled={status === 'loading'}
          style={{ ...styles.btn, opacity: status === 'loading' ? 0.6 : 1 }}
        >
          {status === 'loading' ? 'Revalidating…' : 'Revalidate now'}
        </button>
      </div>

      {status === 'ok' && result && (
        <div style={{ ...styles.resultBox, borderColor: '#238636' }}>
          <strong style={{ color: '#3fb950' }}>✓ Revalidated</strong>
          <p style={styles.resultHint}>
            Tag <code>{selected}</code> is invalidated. Now visit a post — on first load
            Next.js will re-render and attempt to write the new page to the ISR cache.
            Check AppSail function logs for the 401 on <code>/bucket/signature</code>.
          </p>
          <div style={styles.postLinks}>
            {['1', '2', '3', '4', '5'].map((id) => (
              <a key={id} href={`/posts/${id}`} style={styles.postLink}>
                Post #{id} →
              </a>
            ))}
          </div>
          <pre style={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {status === 'error' && result && (
        <div style={{ ...styles.resultBox, borderColor: '#f85149' }}>
          <strong style={{ color: '#f85149' }}>✗ Error</strong>
          <pre style={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div style={styles.divider} />

      <h2 style={styles.sectionTitle}>Other diagnostic tools</h2>
      <div style={styles.linkGrid}>
        <a href="/api/bucket-sig-test" style={styles.diagCard} target="_blank" rel="noreferrer">
          <strong>Bucket Signature Test</strong>
          <span style={styles.diagDesc}>
            Directly calls the <code>/bucket/signature</code> API and shows the raw response.
            Fastest way to confirm the 401.
          </span>
        </a>
        <a href="/api/debug" style={styles.diagCard} target="_blank" rel="noreferrer">
          <strong>Runtime Info</strong>
          <span style={styles.diagDesc}>
            Shows all environment variables and request headers injected by the platform.
          </span>
        </a>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 640, margin: '4rem auto', padding: '0 1.5rem' },
  back: { color: '#58a6ff', textDecoration: 'none', fontSize: '0.9rem' },
  title: { color: '#e6edf3', fontSize: '1.6rem', fontWeight: 700, margin: '1.5rem 0 0.5rem' },
  desc: { color: '#8b949e', lineHeight: 1.6, margin: '0 0 1.5rem' },
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  label: { color: '#8b949e', fontSize: '0.85rem' },
  select: {
    background: '#0d1117',
    color: '#e6edf3',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  btn: {
    background: '#238636',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.6rem 1.25rem',
    fontSize: '0.95rem',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    transition: 'opacity 0.15s',
  },
  resultBox: {
    marginTop: '1.5rem',
    background: '#161b22',
    border: '1px solid',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  resultHint: { color: '#8b949e', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 },
  postLinks: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  postLink: {
    color: '#58a6ff',
    textDecoration: 'none',
    fontSize: '0.85rem',
    background: '#21262d',
    padding: '0.3rem 0.7rem',
    borderRadius: '4px',
  },
  pre: {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '0.75rem',
    color: '#8b949e',
    fontSize: '0.8rem',
    overflow: 'auto',
    margin: 0,
  },
  divider: { borderTop: '1px solid #30363d', margin: '2rem 0' },
  sectionTitle: { color: '#e6edf3', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1rem' },
  linkGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  diagCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    color: '#e6edf3',
    textDecoration: 'none',
  },
  diagDesc: { color: '#8b949e', fontSize: '0.85rem', lineHeight: 1.5 },
};
