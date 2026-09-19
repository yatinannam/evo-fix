"use client";

import { SiteHeader, SiteFooter } from "@/evodoc-components/layout/EvodocShared";
import Link from 'next/link';
import { ArrowUpRight } from "lucide-react";

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
    excerpt: 'Why siloed medical data is dangerous and how our new unified health companion puts the patient in control.',
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

export default function EvoDocBlogPage() {
  return (
    <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0d0d0d', color: '#fff' }}>
      <SiteHeader />
      
      <main style={{ flex: 1, paddingTop: '120px', paddingBottom: '80px' }}>
        {/* Header */}
        <section style={{ padding: '0 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '24px' }}>
            EvoDoc <span style={{ color: '#e1ff00' }}>Blog</span>
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Clinical intelligence, product updates, and insights on the future of medical technology in India.
          </p>
        </section>

        {/* Blog Grid */}
        <section style={{ padding: '0 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
            {BLOG_POSTS.map((post) => (
              <article key={post.id} style={{
                backgroundColor: '#1a1d1f',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.3s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#e1ff00')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                  <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                </div>
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e1ff00' }}>{post.category}</span>
                    <time style={{ fontSize: '0.875rem', color: '#6b7280' }}>{post.date}</time>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.3 }}>
                    <Link href={`/evodoc/blog/${post.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                      {post.title}
                    </Link>
                  </h2>
                  <p style={{ color: '#9ca3af', marginBottom: '32px', lineHeight: 1.6, flex: 1 }}>
                    {post.excerpt}
                  </p>
                  <Link href={`/evodoc/blog/${post.id}`} style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    color: '#e1ff00', 
                    textDecoration: 'none', 
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Read Article <ArrowUpRight size={16} style={{ marginLeft: '8px' }} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
