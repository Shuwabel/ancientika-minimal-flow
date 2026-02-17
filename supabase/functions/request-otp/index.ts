import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple IP-based rate limiting (in-memory, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

function generateOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: 3 requests per 10 minutes per email
    if (!checkRateLimit(`otp:${normalizedEmail}`, 3, 10 * 60 * 1000)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Invalidate existing OTPs for this email
    await supabaseAdmin
      .from("email_otps")
      .delete()
      .eq("email", normalizedEmail);

    // Generate and hash OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Store OTP
    const { error: insertError } = await supabaseAdmin
      .from("email_otps")
      .insert({
        email: normalizedEmail,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
      });

    if (insertError) {
      console.error("Failed to store OTP:", insertError.message);
      return new Response(
        JSON.stringify({ error: "Failed to process request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via Resend (EU region)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #e8e0d8;">
          <h1 style="margin:0;font-size:22px;font-weight:400;color:#3c2a1e;letter-spacing:0.05em;">ANCIENTIKA</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;font-size:18px;font-weight:400;color:#3c2a1e;text-align:center;">Your Login Code</h2>
          <div style="background-color:#f5f0eb;border-radius:8px;padding:24px;text-align:center;margin:16px 0;">
            <span style="font-size:32px;letter-spacing:0.3em;font-weight:600;color:#3c2a1e;">${otp}</span>
          </div>
          <p style="margin:16px 0 0;font-size:14px;color:#7a6b5d;text-align:center;line-height:1.6;">
            This code expires in <strong>5 minutes</strong>.
          </p>
          <p style="margin:24px 0 0;font-size:12px;color:#a89b8c;text-align:center;line-height:1.5;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ancientika Auth <auth@contact.ancientika.com>",
        to: [normalizedEmail],
        subject: "Your Ancientika Login Code",
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errBody = await resendResponse.text();
      console.error("Resend API error:", resendResponse.status, errBody);
      // Clean up the stored OTP since email failed
      await supabaseAdmin.from("email_otps").delete().eq("email", normalizedEmail);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await resendResponse.text(); // consume body
    console.log(`OTP email sent successfully to ${normalizedEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("request-otp error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
