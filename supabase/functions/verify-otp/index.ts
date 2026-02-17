import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp } = await req.json();

    if (!email || typeof email !== "string" || !otp || typeof otp !== "string") {
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      return new Response(
        JSON.stringify({ error: "Invalid verification code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Retrieve OTP record
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("email_otps")
      .select("*")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabaseAdmin.from("email_otps").delete().eq("id", otpRecord.id);
      return new Response(
        JSON.stringify({ error: "Verification code has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await supabaseAdmin.from("email_otps").delete().eq("id", otpRecord.id);
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Constant-time hash comparison
    const inputHash = await hashOtp(normalizedOtp);
    const isValid = constantTimeCompare(inputHash, otpRecord.otp_hash);

    if (!isValid) {
      // Increment attempts
      await supabaseAdmin
        .from("email_otps")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ error: "Invalid verification code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // OTP is valid — delete it
    await supabaseAdmin.from("email_otps").delete().eq("id", otpRecord.id);

    // Sign in user via Supabase Admin API (create user if not exists, then generate session)
    // First check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true,
      });
      if (createError || !newUser.user) {
        console.error("Failed to create user:", createError?.message);
        return new Response(
          JSON.stringify({ error: "Failed to complete sign in" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = newUser.user.id;
    }

    // Generate a session link for the user
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

    if (linkError || !linkData) {
      console.error("Failed to generate session:", linkError?.message);
      return new Response(
        JSON.stringify({ error: "Failed to complete sign in" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token hash from the action link to use for OTP verification on client
    const actionLink = linkData.properties?.action_link;
    if (!actionLink) {
      console.error("No action link returned");
      return new Response(
        JSON.stringify({ error: "Failed to complete sign in" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse token_hash and type from the action link
    const url = new URL(actionLink);
    const tokenHash = url.searchParams.get("token") || url.hash?.match(/token=([^&]+)/)?.[1];
    const type = url.searchParams.get("type") || "magiclink";

    console.log(`User ${normalizedEmail} verified successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        token_hash: tokenHash,
        type,
        email: normalizedEmail,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-otp error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
