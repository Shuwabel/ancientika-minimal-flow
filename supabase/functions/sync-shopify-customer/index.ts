import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOPIFY_STORE_DOMAIN = "ancientika-z1ujy.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_ADMIN_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

const CUSTOMER_LOOKUP_QUERY = `
  query customerLookup($query: String!) {
    customers(first: 1, query: $query) {
      edges { node { id email } }
    }
  }
`;

const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

async function shopifyStorefrontRequest(query: string, variables: Record<string, unknown> = {}) {
  const token = Deno.env.get("SHOPIFY_PRIVATE_STOREFRONT_TOKEN");
  if (!token) throw new Error("Private storefront token not configured");

  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Shopify-Storefront-Private-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`Shopify Storefront HTTP ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(`Storefront GQL: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
  return data;
}

async function shopifyAdminLookupCustomer(email: string): Promise<string | null> {
  const token = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
  if (!token) {
    console.warn("SHOPIFY_ACCESS_TOKEN not set — cannot lookup existing customers");
    return null;
  }

  const response = await fetch(SHOPIFY_ADMIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query: CUSTOMER_LOOKUP_QUERY, variables: { query: `email:${email}` } }),
  });

  if (!response.ok) {
    console.error(`Admin API HTTP ${response.status}`);
    return null;
  }
  const data = await response.json();
  if (data.errors) {
    console.error(`Admin API GQL: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
    return null;
  }
  return data?.data?.customers?.edges?.[0]?.node?.id || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return new Response(JSON.stringify({ error: "userId and email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if profile already has a shopify_customer_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("shopify_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      return new Response(JSON.stringify({ synced: false, reason: "profile_fetch_error" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already synced — stop
    if (profile?.shopify_customer_id) {
      return new Response(JSON.stringify({ synced: true, existing: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to create the customer in Shopify
    // If the customer already exists, Shopify returns a TAKEN error
    const randomPassword = crypto.randomUUID().slice(0, 20) + "A1!";

    const data = await shopifyStorefrontRequest(CUSTOMER_CREATE_MUTATION, {
      input: {
        email: normalizedEmail,
        password: randomPassword,
        acceptsMarketing: false,
      },
    });

    const result = data?.data?.customerCreate;
    const userErrors = result?.customerUserErrors || [];
    const takenError = userErrors.find(
      (e: { code: string }) => e.code === "TAKEN" || e.code === "CUSTOMER_DISABLED"
    );

    if (result?.customer?.id) {
      // Customer created successfully — store the Shopify GID
      const shopifyCustomerId = result.customer.id;

      await supabaseAdmin
        .from("profiles")
        .update({ shopify_customer_id: shopifyCustomerId })
        .eq("user_id", userId);

      console.log(`Shopify customer created for ${normalizedEmail}`);
      return new Response(JSON.stringify({ synced: true, created: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (takenError) {
      // Customer exists — try Admin API to get their real Shopify GID
      const shopifyGid = await shopifyAdminLookupCustomer(normalizedEmail);

      if (shopifyGid) {
        await supabaseAdmin
          .from("profiles")
          .update({ shopify_customer_id: shopifyGid })
          .eq("user_id", userId);

        console.log(`Linked existing Shopify customer ${shopifyGid} for ${normalizedEmail}`);
        return new Response(JSON.stringify({ synced: true, linked: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Admin API unavailable or failed — fall back to marker
      await supabaseAdmin
        .from("profiles")
        .update({ shopify_customer_id: "shopify_exists_unlinked" })
        .eq("user_id", userId);

      console.log(`Shopify customer exists for ${normalizedEmail} (Admin lookup failed, unlinked)`);
      return new Response(JSON.stringify({ synced: true, existing_unlinked: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Other error
    const errorMsg = userErrors.map((e: { message: string }) => e.message).join(", ");
    console.error(`Shopify customerCreate errors for ${normalizedEmail}: ${errorMsg}`);
    return new Response(JSON.stringify({ synced: false, reason: errorMsg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sync-shopify-customer error:", err);
    // Never block auth flow — return success:false but 200
    return new Response(JSON.stringify({ synced: false, reason: "internal_error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
