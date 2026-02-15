import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter (per-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { gender, height, heightUnit, weight, weightUnit, bodyShape, fitPreference, category, sizeChart } = body;

    // Validate required fields
    if (!height || !weight || !category || !sizeChart) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate input types and lengths
    const h = Number(height);
    const w = Number(weight);
    if (isNaN(h) || isNaN(w) || h <= 0 || h > 300 || w <= 0 || w > 500) {
      return new Response(JSON.stringify({ error: "Invalid height or weight values" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowedUnits = { height: ["cm", "in", "ft"], weight: ["kg", "lbs"] };
    if (heightUnit && !allowedUnits.height.includes(heightUnit)) {
      return new Response(JSON.stringify({ error: "Invalid height unit" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (weightUnit && !allowedUnits.weight.includes(weightUnit)) {
      return new Response(JSON.stringify({ error: "Invalid weight unit" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize string inputs
    const sanitize = (val: unknown, maxLen: number): string =>
      typeof val === "string" ? val.slice(0, maxLen).replace(/[<>]/g, "") : "";

    const safeGender = sanitize(gender, 20);
    const safeBodyShape = sanitize(bodyShape, 30);
    const safeFitPreference = sanitize(fitPreference, 20);
    const safeCategory = sanitize(category, 50);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("Required API key is not configured");
      return new Response(JSON.stringify({ error: "Unable to provide size recommendation. Please try again later." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build chart text for prompt
    const chartText = sizeChart.measurements
      .map(
        (m: { label: string; values: Record<string, string> }) =>
          `${m.label}: ${Object.entries(m.values).map(([s, v]) => `${s}=${v}`).join(", ")}`
      )
      .join("\n");

    const prompt = `You are a fashion sizing expert. Based on the customer's body measurements and the size chart below, recommend the single best size.

Customer Profile:
- Gender/Fit type: ${safeGender}
- Height: ${h} ${heightUnit || "cm"}
- Weight: ${w} ${weightUnit || "kg"}
- Body shape: ${safeBodyShape}
- Fit preference: ${safeFitPreference} (tight = closer to body, regular = standard, loose = relaxed)

Product Category: ${safeCategory}

Size Chart:
${chartText}

Available sizes: ${sizeChart.sizes.join(", ")}

Rules:
- Return ONLY a JSON object with "size" (one of the available sizes) and "explanation" (1-2 sentences explaining why).
- For "tight" fit preference, lean towards a size down. For "loose", lean towards a size up.
- Consider body shape: athletic/slim bodies may prefer different fits than relaxed body shapes.
- Be concise and helpful.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway request failed");
      const retryStatus = response.status === 429 ? 429 : 503;
      return new Response(JSON.stringify({ error: "Unable to provide size recommendation. Please try again later." }), {
        status: retryStatus,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    let parsed: { size: string; explanation: string };
    try {
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { size: sizeChart.sizes[2], explanation: "Based on your measurements, a medium size should fit well." };
    } catch {
      parsed = { size: sizeChart.sizes[2], explanation: "Based on your measurements, a medium size should fit well." };
    }

    // Validate the size is in the chart
    if (!sizeChart.sizes.includes(parsed.size)) {
      parsed.size = sizeChart.sizes[2]; // fallback to M
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("size-recommender: unexpected error");
    return new Response(JSON.stringify({ error: "Unable to provide size recommendation. Please try again later." }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
