'use client';
import dynamic from 'next/dynamic';

// ssr: false prevents GSAP/window-dependent code from running on the server,
// which was the most likely cause of blank pages on Safari (hydration crash).
// 'use client' is required — Next.js only allows ssr:false inside Client Components.
const App = dynamic(() => import('@/evocare-components/App'), {
  ssr: false,
  loading: () => null,
});

export default function EvoCarePage() {
  return <App />;
}
