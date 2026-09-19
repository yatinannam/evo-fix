import { headers } from 'next/headers';
import EvoDocContent from './EvoDocPage';

export default async function EvoDocPage() {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return <EvoDocContent nonce={nonce} />;
}
