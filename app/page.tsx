// Static home page — no ISR, no SSR. Built once at deploy time.
const PRODUCT_IDS = ['1', '2', '3', '4', '5'];
const ARTICLE_IDS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const REVIEW_IDS  = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function Home() {
  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.siteTitle}>TechStore</h1>
        <p style={styles.tagline}>Next.js rendering demo — SSG · ISR · SSR</p>
      </header>

      {/* ── SSG ─────────────────────────────────────────────────────────── */}
      <section style={styles.section}>
        <div style={styles.sectionHead}>
          <h2 style={styles.sectionTitle}>Featured Products</h2>
          <span style={{ ...styles.badge, ...styles.badgeSsg }}>🏗️ SSG</span>
        </div>
        <p style={styles.hint}>
          Built once at deploy time. Timestamp is <strong style={{ color: '#79c0ff' }}>frozen forever</strong> — refresh 100 times, it never changes.
        </p>
        <div style={styles.grid}>
          {PRODUCT_IDS.map((id) => (
            <a key={id} href={`/products/${id}`} style={styles.card}>
              <span style={styles.cardEmoji}>📦</span>
              <span style={styles.cardLabel}>Product {id}</span>
              <span style={styles.cardPrice}>${(parseInt(id) * 29 + 49).toFixed(2)}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── ISR ─────────────────────────────────────────────────────────── */}
      <section style={{ ...styles.section, marginTop: '2.5rem' }}>
        <div style={styles.sectionHead}>
          <h2 style={styles.sectionTitle}>Blog Posts</h2>
          <span style={{ ...styles.badge, ...styles.badgeIsr }}>♻️ ISR</span>
        </div>
        <p style={styles.hint}>
          Cached after first render. Revalidates every <strong style={{ color: '#56d364' }}>30 seconds</strong> in background — timestamp changes every ~30s.
        </p>
        <div style={styles.listGroup}>
          {ARTICLE_IDS.map((id) => (
            <a key={id} href={`/posts/${id}`} style={styles.listItem}>
              <span style={styles.listLabel}>Article #{id}</span>
              <span style={styles.listArrow}>→</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── SSR ─────────────────────────────────────────────────────────── */}
      <section style={{ ...styles.section, marginTop: '2.5rem' }}>
        <div style={styles.sectionHead}>
          <h2 style={styles.sectionTitle}>Customer Reviews</h2>
          <span style={{ ...styles.badge, ...styles.badgeSsr }}>⚡ SSR</span>
        </div>
        <p style={styles.hint}>
          Rendered fresh on <strong style={{ color: '#ff7b72' }}>every single request</strong> — timestamp changes each time you refresh.
        </p>
        <div style={styles.listGroup}>
          {REVIEW_IDS.map((id) => (
            <a key={id} href={`/reviews/${id}`} style={styles.listItem}>
              <span style={styles.listLabel}>Review #{id}</span>
              <span style={styles.listArrow}>→</span>
            </a>
          ))}
        </div>
      </section>

      <footer style={styles.footer}>
        <a href="/revalidate" style={styles.footerLink}>Developer tools</a>
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 720, margin: '3rem auto', padding: '0 1.5rem' },
  header: { marginBottom: '2.5rem', borderBottom: '1px solid #30363d', paddingBottom: '1.5rem' },
  siteTitle: { fontSize: '2rem', fontWeight: 800, color: '#e6edf3', margin: 0 },
  tagline: { color: '#8b949e', marginTop: '0.3rem', fontSize: '0.95rem', margin: '0.3rem 0 0' },
  section: {},
  sectionHead: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' },
  sectionTitle: { color: '#e6edf3', fontSize: '1.1rem', fontWeight: 600, margin: 0 },
  badge: { borderRadius: '12px', padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, border: '1px solid' },
  badgeSsg: { background: '#1c2a3a', color: '#79c0ff', borderColor: '#388bfd' },
  badgeIsr: { background: '#1a3326', color: '#56d364', borderColor: '#3fb950' },
  badgeSsr: { background: '#2d1a1a', color: '#ff7b72', borderColor: '#f85149' },
  hint: { color: '#6e7681', fontSize: '0.82rem', margin: '0 0 1rem', lineHeight: 1.5 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
    padding: '1rem',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    color: '#e6edf3',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  cardEmoji: { fontSize: '1.5rem' },
  cardLabel: { fontWeight: 600, color: '#e6edf3' },
  cardPrice: { color: '#3fb950', fontWeight: 700, fontSize: '0.95rem' },
  listGroup: { display: 'flex', flexDirection: 'column' as const },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    background: '#161b22',
    border: '1px solid #30363d',
    borderTop: 'none',
    color: '#e6edf3',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  listLabel: { fontWeight: 500 },
  listArrow: { color: '#58a6ff' },
  footer: { marginTop: '3rem', color: '#8b949e', fontSize: '0.82rem', borderTop: '1px solid #30363d', paddingTop: '1.25rem' },
  footerLink: { color: '#8b949e', textDecoration: 'none' },
};
