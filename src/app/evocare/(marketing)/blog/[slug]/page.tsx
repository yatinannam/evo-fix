import React from 'react';
import Link from 'next/link';

export default async function EvoCareBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div style={{ backgroundColor: '#f0f9ff', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px', color: '#1e293b' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <Link href="/evocare/blog" style={{ color: '#00c3d9', textDecoration: 'none', marginBottom: '32px', display: 'inline-block', fontWeight: 600 }}>
          &larr; Back to all posts
        </Link>
        <article style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '48px', boxShadow: '0 10px 40px -10px rgba(0, 195, 217, 0.1)' }}>
          <header style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2, textTransform: 'capitalize', color: '#0f172a' }}>
              {slug.replace(/-/g, ' ')}
            </h1>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
              <span>Published recently</span>
            </div>
          </header>
          <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.125rem' }}>
            <p>
              This is a placeholder page for the article <strong>{slug}</strong>. 
              The full content for this EvoCare blog post will be loaded from the CMS once connected.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
