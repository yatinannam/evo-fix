'use client';
import "./blog.css";
import Link from "next/link";
import Image from "next/image";

const BLOG_POSTS = [
  {
    id: 1,
    title: 'The Future of AI in Clinical Workflows',
    excerpt: 'How AI copilots are reducing administrative burden for doctors globally, leading to better patient outcomes and reduced burnout.',
    date: 'Jul 18, 2026',
    category: 'Industry Insights',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Introducing the Unified Health Record',
    excerpt: 'Why siloed medical data is dangerous and how our new unified health companion, EvoCare, puts the patient in control.',
    date: 'Jul 12, 2026',
    category: 'Product News',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Security and Privacy in AI Medicine',
    excerpt: 'We take a deep dive into the encryption and compliance standards that protect your sensitive medical information.',
    date: 'Jun 28, 2026',
    category: 'Security',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

export default function EvoCareBlogPage() {
  return (
    <div className="evocare-blog-wrapper">
      <header className="nav">
        <div className="nav-inner">
          <a href="/evocare" className="logo">
            <Image src="/evocare_logo.png" alt="EvoCare" width={110} height={30} style={{objectFit:"contain"}}/>
          </a>
          <nav className="links">
            <a href="/evocare/about">About Us</a>
            <a href="/evodoc/contact">Contact Us</a>
            <a href="/evocare/blog" className="active">Blog</a>
          </nav>
          <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
            <a href="/evocare/login" className="btn btn-outline" style={{padding:"10px 18px", fontSize:"13.5px"}}>Login / Sign up</a>
            <button className="menu-toggle" aria-label="Open menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <span className="eyebrow-pill">EvoCare Blog</span>
          <h1>Insights & Stories for a Healthier You.</h1>
          <p className="lede">
            Discover the latest news, wellness tips, and deep dives into how we are redefining personal health records for everyone.
          </p>
        </section>

        {/* BLOG GRID */}
        <section className="blog-grid">
          {BLOG_POSTS.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="card-image">
                <img src={post.imageUrl} alt={post.title} />
              </div>
              <div className="card-content">
                <div className="card-meta">
                  <span className="card-category">{post.category}</span>
                  <span className="card-date">{post.date}</span>
                </div>
                <h2 className="card-title">
                  <Link href={`/evocare/blog/${post.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {post.title}
                  </Link>
                </h2>
                <p className="card-excerpt">
                  {post.excerpt}
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <Link href={`/evocare/blog/${post.id}`} className="read-more">
                    Read Article
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
