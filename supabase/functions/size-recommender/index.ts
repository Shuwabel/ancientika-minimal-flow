import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gender, height, heightUnit, weight, weightUnit, bodyShape, fitPreference, category, sizeChart } =
      await req.json();

    if (!height || !weight || !category || !sizeChart) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
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
- Gender/Fit type: ${gender}
- Height: ${height} ${heightUnit}
- Weight: ${weight} ${weightUnit}
- Body shape: ${bodyShape}
- Fit preference: ${fitPreference} (tight = closer to body, regular = standard, loose = relaxed)

Product Category: ${sizeChart.category}

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

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Service busy, please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Failed to get recommendation" }), {
        status: 500,
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
    console.error("size-recommender error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
