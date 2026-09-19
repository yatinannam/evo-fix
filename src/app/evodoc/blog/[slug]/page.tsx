import React from 'react';
import Link from 'next/link';

export default async function EvoDocBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px', color: '#fff' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <Link href="/evodoc/blog" style={{ color: '#e1ff00', textDecoration: 'none', marginBottom: '32px', display: 'inline-block', fontWeight: 600 }}>
          &larr; Back to all posts
        </Link>
        <article style={{ backgroundColor: '#1a1d1f', borderRadius: '16px', padding: '48px', border: '1px solid #333' }}>
          <header style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2, textTransform: 'capitalize' }}>
              {slug.replace(/-/g, ' ')}
            </h1>
            <div style={{ color: '#888', fontSize: '0.875rem' }}>
              <span>Published recently</span>
            </div>
          </header>
          <div style={{ color: '#ccc', lineHeight: 1.8, fontSize: '1.125rem' }}>
            <p>
              This is a placeholder page for the article <strong>{slug}</strong>. 
              The full content for this EvoDoc blog post will be loaded from the CMS once connected.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
