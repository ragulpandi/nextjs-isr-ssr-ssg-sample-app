// ISR — Incremental Static Regeneration.
// Page is cached after first render. Cache expires every 30 seconds.
// After expiry: next request is served stale while Next.js rebuilds in background.
// The FOLLOWING request gets the fresh version. Timestamp changes every ~30s.
export const revalidate = 30;

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

async function getPost(id: string): Promise<Post> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    next: {
      tags: ['posts', `post-${id}`],
      revalidate: 30,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch post (HTTP ${res.status})`);
  return res.json();
}

export default async function PostPage({ params }: { params: { id: string } }) {
  let post: Post | null = null;
  let fetchError: string | null = null;

  try {
    post = await getPost(params.id);
  } catch (err) {
    fetchError = String(err);
  }

  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>← TechStore</a>

      {fetchError ? (
        <div style={styles.errorBox}>
          <strong>Could not load article</strong>
          <p style={{ margin: '0.5rem 0 0', color: '#ffa198' }}>{fetchError}</p>
        </div>
      ) : (
        <article style={styles.article}>
          <div style={styles.renderBadge}>
            <span style={styles.renderTag}>♻️ ISR</span>
            <span style={styles.renderDesc}>Incremental Static Regeneration — cached, revalidates every 30s</span>
          </div>
          <p style={styles.meta}>Article #{params.id}</p>
          <h1 style={styles.title}>{post?.title}</h1>
          <p style={styles.body}>{post?.body}</p>
          <p style={styles.timestamp}>
            🕐 Page generated at: <strong>{new Date().toISOString()}</strong>
            <br />
            <span style={{ fontSize: '0.8em', color: '#6e7681' }}>
              Refresh quickly → <strong style={{ color: '#3fb950' }}>same timestamp</strong> (served from cache).
              Wait 30s then refresh twice → <strong style={{ color: '#f0883e' }}>new timestamp</strong> (ISR revalidated ✅)
            </span>
          </p>
        </article>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 640, margin: '4rem auto', padding: '0 1.5rem' },
  back: { color: '#58a6ff', textDecoration: 'none', fontSize: '0.9rem' },
  errorBox: {
    marginTop: '1.5rem',
    background: '#3d1a1a',
    border: '1px solid #f85149',
    padding: '1rem',
    borderRadius: '6px',
    color: '#f85149',
  },
  article: { marginTop: '1.5rem' },
  meta: { color: '#8b949e', fontSize: '0.85rem', margin: '0 0 0.5rem' },
  title: { color: '#e6edf3', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem' },
  body: { color: '#c9d1d9', lineHeight: 1.7, margin: 0 },
  renderBadge: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' },
  renderTag: { background: '#1a3326', color: '#56d364', border: '1px solid #3fb950', borderRadius: '12px', padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' as const },
  renderDesc: { color: '#8b949e', fontSize: '0.82rem' },
  timestamp: { marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #30363d', color: '#8b949e', fontSize: '0.85rem' },
};

export async function generateStaticParams() {
  return [];
}
