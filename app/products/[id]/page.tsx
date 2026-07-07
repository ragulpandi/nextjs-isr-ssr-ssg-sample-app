// SSG — Static Site Generation.
// Page is pre-rendered at BUILD TIME for IDs 1-5 (see generateStaticParams below).
// No revalidate: the HTML is frozen — visiting the page 1000 times shows the same timestamp.
// To update content, you must redeploy.

interface Product {
  id: number;
  title: string;
  body: string;
  userId: number;
}

async function getProduct(id: string): Promise<Product> {
  // cache: 'force-cache' is the default for SSG — fetched once at build, cached forever.
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    cache: 'force-cache',
  });
  if (!res.ok) throw new Error(`Product not found (HTTP ${res.status})`);
  return res.json();
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  const price = (product.id * 29 + 49).toFixed(2);
  const rating = ((product.id % 5) + 1) + 0.5;
  const reviewCount = product.id * 17 + 23;

  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>← TechStore</a>

      <div style={styles.breadcrumb}>
        <a href="/" style={styles.breadcrumbLink}>Home</a>
        <span style={styles.breadcrumbSep}>/</span>
        <a href="/" style={styles.breadcrumbLink}>Products</a>
        <span style={styles.breadcrumbSep}>/</span>
        <span style={styles.breadcrumbCurrent}>Product {product.id}</span>
      </div>

      <div style={styles.layout}>
        <div style={styles.imageBox}>
          <div style={styles.imagePlaceholder}>📦</div>
          <div style={styles.badge}>In Stock</div>
        </div>

        <div style={styles.details}>
          <p style={styles.sku}>SKU: TECH-{String(product.id).padStart(4, '0')}</p>
          <h1 style={styles.title}>{product.title}</h1>
          <div style={styles.ratingRow}>
            <span style={styles.stars}>{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>
            <span style={styles.reviewCount}>({reviewCount} reviews)</span>
          </div>
          <p style={styles.price}>${price}</p>
          <p style={styles.desc}>{product.body}</p>
          <div style={styles.actions}>
            <button style={styles.btnBuy}>Add to Cart</button>
            <button style={styles.btnWish}>♡ Wishlist</button>
          </div>
        </div>
      </div>

      <section style={styles.specs}>
        <h2 style={styles.specsTitle}>Specifications</h2>
        <div style={styles.specsGrid}>
          <div style={styles.specRow}><span style={styles.specKey}>Brand</span><span>TechCo</span></div>
          <div style={styles.specRow}><span style={styles.specKey}>Model</span><span>TC-{product.id}X</span></div>
          <div style={styles.specRow}><span style={styles.specKey}>Category</span><span>Electronics</span></div>
          <div style={styles.specRow}><span style={styles.specKey}>Warranty</span><span>2 years</span></div>
        </div>
      </section>

      <div style={styles.renderBadge}>
        <span style={styles.renderTag}>🏗️ SSG</span>
        <span style={styles.renderDesc}>Static Site Generation — rendered once at build time</span>
      </div>
      <p style={styles.timestamp}>
        🕐 Built at: <strong>{new Date().toISOString()}</strong>
        <br />
        <span style={{ fontSize: '0.8em', color: '#6e7681' }}>
          This timestamp is <strong style={{ color: '#f0883e' }}>fixed forever</strong> — it never changes no matter how many times you refresh. To change it, redeploy. ✅
        </span>
      </p>
    </main>
  );
}

// ── generateStaticParams (SSG) ────────────────────────────────────────────
// These 5 pages are pre-built as static HTML at deploy time.
// No server is involved at request time — pure static file serving.
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 860, margin: '3rem auto', padding: '0 1.5rem' },
  back: { color: '#58a6ff', textDecoration: 'none', fontSize: '0.85rem' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1rem', fontSize: '0.82rem' },
  breadcrumbLink: { color: '#58a6ff', textDecoration: 'none' },
  breadcrumbSep: { color: '#6e7681' },
  breadcrumbCurrent: { color: '#8b949e' },
  layout: {
    display: 'flex',
    gap: '2.5rem',
    marginTop: '1.75rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap' as const,
  },
  imageBox: {
    flex: '0 0 280px',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '10px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
    position: 'relative' as const,
  },
  imagePlaceholder: { fontSize: '5rem' },
  badge: {
    background: '#1a4731',
    color: '#3fb950',
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    border: '1px solid #3fb950',
  },
  details: { flex: 1, minWidth: 0 },
  sku: { color: '#6e7681', fontSize: '0.78rem', margin: '0 0 0.5rem' },
  title: { color: '#e6edf3', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.75rem', lineHeight: 1.4 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  stars: { color: '#f0883e', fontSize: '0.95rem' },
  reviewCount: { color: '#8b949e', fontSize: '0.82rem' },
  price: { fontSize: '1.8rem', fontWeight: 800, color: '#3fb950', margin: '0 0 1rem' },
  desc: { color: '#8b949e', lineHeight: 1.7, fontSize: '0.9rem', margin: '0 0 1.5rem' },
  actions: { display: 'flex', gap: '0.75rem' },
  btnBuy: {
    background: '#238636',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.5rem',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  btnWish: {
    background: '#21262d',
    color: '#c9d1d9',
    border: '1px solid #30363d',
    padding: '0.6rem 1.25rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  specs: { marginTop: '3rem', borderTop: '1px solid #30363d', paddingTop: '1.5rem' },
  specsTitle: { color: '#e6edf3', fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem' },
  specsGrid: { display: 'flex', flexDirection: 'column' as const, gap: '0' },
  specRow: {
    display: 'flex',
    padding: '0.6rem 0',
    borderBottom: '1px solid #21262d',
    fontSize: '0.88rem',
    color: '#c9d1d9',
    gap: '2rem',
  },
  specKey: { color: '#8b949e', minWidth: 100 },
  renderBadge: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #30363d' },
  renderTag: { background: '#1c2a3a', color: '#79c0ff', border: '1px solid #388bfd', borderRadius: '12px', padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' as const },
  renderDesc: { color: '#8b949e', fontSize: '0.82rem' },
  timestamp: { marginTop: '0.75rem', color: '#8b949e', fontSize: '0.85rem' },
};
