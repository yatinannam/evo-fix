/**
 * AI Service stub for the EvoDoc demo.
 * Replace with a real AI API call in production.
 */
export async function sendMessageToAI(
  message: string,
  context?: Record<string, unknown>
): Promise<string> {
  // Stub — returns an empty string in production builds.
  // The demo UI handles this gracefully.
  console.warn('[aiService] sendMessageToAI called but no AI backend is configured.');
  return '';
}
