import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Phone numbers are saved in the 'profiles' table upon successful onboarding.
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .limit(1);

    if (error) {
      console.error("[api/check-phone] Admin db error:", error);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }

    return NextResponse.json({
      exists: data && data.length > 0,
    });
  } catch (err) {
    console.error("[api/check-phone] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
