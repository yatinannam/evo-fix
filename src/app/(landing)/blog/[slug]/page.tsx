import React from 'react';
import Link from 'next/link';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', paddingTop: '160px', paddingBottom: '120px', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <Link href="/blog" style={{ color: '#a1a1aa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '40px', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          &larr; Back to Blog
        </Link>
        <article style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', padding: '48px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <header style={{ marginBottom: '40px' }}>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', fontWeight: 700, marginBottom: '24px', lineHeight: 1.1, textTransform: 'capitalize', letterSpacing: '-0.02em' }}>
              {slug.replace(/-/g, ' ')}
            </h1>
            <div style={{ color: '#71717a', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>Published recently</span>
              <span style={{ width: '4px', height: '4px', backgroundColor: '#3f3f46', borderRadius: '50%' }}></span>
              <span>By Evo Team</span>
            </div>
          </header>
          <div style={{ color: '#d4d4d8', lineHeight: 1.8, fontSize: '1.125rem' }}>
            <p style={{ marginBottom: '24px' }}>
              This is a placeholder page for the article <strong style={{ color: '#fff' }}>{slug}</strong>. 
              The full content for this blog post will be loaded from the CMS once connected.
            </p>
            <p>
              In the future, this page will beautifully render markdown or rich text content, seamlessly matching our dark, glassmorphic design system to provide an immersive reading experience.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
