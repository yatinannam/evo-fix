import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Per-request CSP with a fresh nonce for every response.
 *
 * script-src intentionally has no 'unsafe-inline' — every inline <script>
 * (currently just the JSON-LD block in app/layout.tsx) must read its nonce
 * from the `x-nonce` request header (see layout.tsx) and pass it via the
 * `nonce` prop, or the browser will refuse to run it.
 *
 * connect-src/img-src are scoped to exactly the backend API and Supabase
 * project this deployment talks to (both are public NEXT_PUBLIC_* values,
 * safe to read here) rather than a wildcard.
 */
function buildCsp(nonce: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const empDashSupabaseUrl = process.env.NEXT_PUBLIC_EMPDASH_SUPABASE_URL || "";

  const connectSrc = ["'self'", apiUrl, supabaseUrl, empDashSupabaseUrl].filter(Boolean).join(" ");
  const imgSrc = ["'self'", "data:", "blob:", apiUrl].filter(Boolean).join(" ");
  // /share/[token] embeds a PDF preview from the backend in an <iframe> —
  // the only iframe this app renders — so frame-src needs the API origin
  // rather than 'none'.
  const frameSrc = ["'self'", apiUrl].filter(Boolean).join(" ");
  // React's dev-mode debugging (component stack reconstruction, Fast
  // Refresh) calls eval(); it never does in production builds. Without this
  // the CSP has no effect on prod security — it only silences a dev-only
  // console warning — so it is gated behind NODE_ENV.
  const scriptSrc = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"];
  if (process.env.NODE_ENV !== "production") scriptSrc.push("'unsafe-eval'");

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(" ")}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src ${imgSrc}`,
    `media-src 'self'`,
    `connect-src ${connectSrc}`,
    `worker-src 'self'`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-src ${frameSrc}`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets, the Next internals, and
    // heart-embed.html — that file is a third-party-embeddable widget with
    // its own header rules in next.config.ts and must stay frameable.
    "/((?!_next/static|_next/image|favicon\\.ico|heart-embed\\.html|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|webm|woff|woff2|ttf|css|js|map)$).*)",
  ],
};
