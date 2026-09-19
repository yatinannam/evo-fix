import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Blog | Evo',
  description: 'Insights, updates, and thoughts on AI in healthcare.',
};

const BLOG_POSTS = [
  {
    id: 1,
    title: 'The Future of AI in Clinical Workflows',
    excerpt: 'How AI copilots are reducing administrative burden for doctors globally, leading to better patient outcomes and reduced burnout.',
    date: 'Jul 18, 2026',
    category: 'Industry Insights',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    accentColor: '#e1ff00', // EvoDoc color
  },
  {
    id: 2,
    title: 'Introducing the Unified Health Record',
    excerpt: 'Why siloed medical data is dangerous and how our new unified health companion, EvoCare, puts the patient in control.',
    date: 'Jul 12, 2026',
    category: 'Product News',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    accentColor: '#74d3e0', // EvoCare color
  },
  {
    id: 3,
    title: 'Security and Privacy in AI Medicine',
    excerpt: 'We take a deep dive into the encryption and compliance standards that protect your sensitive medical information.',
    date: 'Jun 28, 2026',
    category: 'Security',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    accentColor: '#ffffff',
  },
];

export default function LandingBlogPage() {
  return (
    <main style={{ backgroundColor: '#0a0a0a', color: '#ffffff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      {/* Header */}
      <section style={{ paddingTop: '160px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          Evo <span style={{ color: '#e1ff00', fontStyle: 'italic' }}>Blog</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Thoughts, updates, and insights at the intersection of artificial intelligence and healthcare.
        </p>
      </section>

      {/* Blog Grid */}
      <section style={{ padding: '40px 24px 120px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {BLOG_POSTS.map((post) => (
            <article key={post.id} style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s ease, border-color 0.3s ease'
            }}
            className="hover:-translate-y-1 hover:border-slate-500/50">
              <div style={{ height: '240px', width: '100%', overflow: 'hidden' }}>
                <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0a0a0a', backgroundColor: post.accentColor, padding: '4px 12px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {post.category}
                  </span>
                  <time style={{ fontSize: '0.875rem', color: '#71717a' }}>{post.date}</time>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.3 }}>
                  <Link href={`/blog/${post.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </h2>
                <p style={{ color: '#a1a1aa', marginBottom: '24px', flexGrow: 1, lineHeight: 1.6 }}>
                  {post.excerpt}
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <Link href={`/blog/${post.id}`} style={{ color: post.accentColor, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Read Article &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
