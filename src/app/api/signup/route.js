import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ipLastSubmit = new Map();
const THROTTLE_MS = 30000;

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    firstName, lastName, email, phone, designation, organization,
    feedback, earlyAccess, termsAccepted, source = "pre-register", website,
  } = body;

  if (website) {
    return NextResponse.json({ success: true });
  }

  if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
    return NextResponse.json({ error: "First name is required." }, { status: 400 });
  }
  if (!lastName || typeof lastName !== "string" || !lastName.trim()) {
    return NextResponse.json({ error: "Last name is required." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }
  if (termsAccepted !== true) {
    return NextResponse.json({ error: "You must accept the Terms and Conditions to continue." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const now = Date.now();
  const lastTime = ipLastSubmit.get(ip);
  // NOTE: This throttle resets on cold starts and does not work across multiple
  // serverless instances. Replace with Upstash Redis if abuse becomes a problem.
  if (lastTime && now - lastTime < THROTTLE_MS) {
    return NextResponse.json({ error: "Please wait a moment before submitting again." }, { status: 429 });
  }
  ipLastSubmit.set(ip, now);

  const userAgent = request.headers.get("user-agent") ?? null;
  const { error: dbError } = await supabaseAdmin.from("signups").insert([{
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    designation: designation?.trim() || null,
    organization: organization?.trim() || null,
    feedback: feedback?.trim() || null,
    early_access: earlyAccess === true,
    terms_accepted: true,
    source,
    user_agent: userAgent,
  }]);

  if (dbError) {
    console.error("[api/signup] Supabase insert error:", dbError);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  // The marketing form lives on the frontend, while SES credentials are kept
  // exclusively in the backend. This sends a receipt to the applicant and a
  // notification to contact@evodoc.site without exposing mail credentials.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  try {
    await fetch(`${apiUrl}/api/public/pre-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, phone, designation, organization, feedback }),
      cache: "no-store",
    });
  } catch (err) {
    // The registration is safely stored above. Email is retriable operational
    // work and should not make a valid form submission look like a failure.
    console.warn("[api/signup] confirmation email request failed:", err.message);
  }

  if (process.env.ENABLE_WEB3FORMS_NOTIFY === "true") {
    const w3fKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (w3fKey) {
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: w3fKey,
          name: `${firstName} ${lastName}`,
          email,
          message: `New EvoDoc signup!\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone || "-"}\nDesignation: ${designation || "-"}\nOrganization: ${organization || "-"}\nFeedback: ${feedback || "-"}\nSource: ${source}`,
          subject: `New EvoDoc Pre-Registration - ${firstName} ${lastName}`,
        }),
      }).catch((err) => {
        console.warn("[api/signup] Web3Forms notification failed (non-fatal):", err);
      });
    } else {
      console.warn("[api/signup] ENABLE_WEB3FORMS_NOTIFY=true but WEB3FORMS_ACCESS_KEY is not set.");
    }
  }

  return NextResponse.json({ success: true });
}
