import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Since we don't have a direct getUserByEmail in Supabase JS v2 Admin API,
    // and we want to avoid mutating auth state, we fetch a large page of users.
    // For production scaling beyond 1000 users, an RPC function in Postgres is recommended.
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error("[api/check-email] Admin listUsers error:", error);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }

    const user = data.users.find((u) => u.email === email.trim().toLowerCase());

    if (!user) {
      return NextResponse.json({
        exists: false,
        confirmed: false,
        hasPassword: false,
      });
    }

    return NextResponse.json({
      exists: true,
      confirmed: !!user.email_confirmed_at,
      hasPassword: !!user.user_metadata?.password_setup_done,
    });
  } catch (err) {
    console.error("[api/check-email] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
