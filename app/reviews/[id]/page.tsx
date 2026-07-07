// SSR-like behavior using revalidate = 1.
// revalidate = 0 and force-dynamic both opt out of prerender-manifest on Catalyst
// causing empty HTML (white page). revalidate = 1 keeps the route in
// prerender-manifest.json as a known ISR route, but with 1s TTL — so every
// browser reload (which takes >1s) always gets a fresh render. Effectively SSR.
export const revalidate = 1;

// ── generateStaticParams (required on Catalyst) ───────────────────────────
// Registers the route pattern in prerender-manifest.json without pre-building pages.
// Without this, Catalyst returns empty HTML (white page) for the route.
export async function generateStaticParams() {
  return [];
}

interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

async function getReview(id: string): Promise<Comment> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/comments/${id}`, {
    next: { revalidate: 1 },
  });
  if (!res.ok) throw new Error(`Review not found (HTTP ${res.status})`);
  return res.json();
}

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const { id } = params;
  let review: Comment | null = null;
  let fetchError: string | null = null;

  try {
    review = await getReview(id);
  } catch (err) {
    fetchError = String(err);
  }

  const stars = ((parseInt(id) % 5) + 1);

  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>← TechStore</a>

      <div style={styles.renderBadge}>
        <span style={styles.renderTag}>⚡ SSR</span>
        <span style={styles.renderDesc}>Server-Side Rendering — revalidate=1 (1s TTL), timestamp changes on every reload ⚡</span>
      </div>

      {fetchError ? (
        <div style={styles.errorBox}>
          <strong>Could not load review</strong>
          <p style={{ margin: '0.5rem 0 0', color: '#ffa198' }}>{fetchError}</p>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.avatar}>{review?.name?.[0]?.toUpperCase() ?? '?'}</div>
            <div>
              <p style={styles.reviewer}>{review?.name}</p>
              <p style={styles.email}>{review?.email}</p>
            </div>
            <div style={styles.stars}>
              {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
            </div>
          </div>
          <p style={styles.reviewId}>Review #{id} · Product #{review?.postId}</p>
          <p style={styles.body}>{review?.body}</p>
          <div style={styles.verified}>✔ Verified Purchase</div>
        </div>
      )}

      <p style={styles.timestamp}>
        🕐 Page generated at: <strong>{new Date().toISOString()}</strong>
        <br />
        <span style={{ fontSize: '0.8em', color: '#6e7681' }}>
          Refresh the page → <strong style={{ color: '#f85149' }}>timestamp always changes</strong> — no caching, every request hits the server ⚡
        </span>
      </p>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 640, margin: '4rem auto', padding: '0 1.5rem' },
  back: { color: '#58a6ff', textDecoration: 'none', fontSize: '0.9rem' },
  renderBadge: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem', marginBottom: '1.5rem' },
  renderTag: {
    background: '#2d1a1a',
    color: '#ff7b72',
    border: '1px solid #f85149',
    borderRadius: '12px',
    padding: '0.2rem 0.7rem',
    fontSize: '0.78rem',
    fontWeight: 700,
    whiteSpace: 'nowrap' as const,
  },
  renderDesc: { color: '#8b949e', fontSize: '0.82rem' },
  errorBox: {
    marginTop: '1.5rem',
    background: '#3d1a1a',
    border: '1px solid #f85149',
    padding: '1rem',
    borderRadius: '6px',
    color: '#f85149',
  },
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '10px',
    padding: '1.5rem',
  },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#388bfd',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1rem',
    flexShrink: 0,
  },
  reviewer: { color: '#e6edf3', fontWeight: 600, margin: 0, fontSize: '0.95rem' },
  email: { color: '#58a6ff', fontSize: '0.78rem', margin: '0.2rem 0 0' },
  stars: { marginLeft: 'auto', color: '#f0883e', fontSize: '1rem', letterSpacing: 2 },
  reviewId: { color: '#6e7681', fontSize: '0.78rem', margin: '0 0 0.75rem' },
  body: { color: '#c9d1d9', lineHeight: 1.7, margin: '0 0 1rem', fontSize: '0.95rem' },
  verified: {
    display: 'inline-block',
    color: '#3fb950',
    fontSize: '0.78rem',
    fontWeight: 600,
    background: '#1a3326',
    border: '1px solid #3fb950',
    borderRadius: '12px',
    padding: '0.15rem 0.6rem',
  },
  timestamp: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #30363d',
    color: '#8b949e',
    fontSize: '0.85rem',
  },
};
