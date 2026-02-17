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

const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
        phone
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ADDRESS_CREATE = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
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

    // Fetch full profile for sync data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("shopify_customer_id, phone, first_name, last_name, address_line1, address_line2, city, state, postal_code, country")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      return new Response(JSON.stringify({ synced: false, reason: "profile_fetch_error" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only skip if we have a real Shopify GID
    if (profile?.shopify_customer_id?.startsWith("gid://")) {
      return new Response(JSON.stringify({ synced: true, existing: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build customer create input with all available profile data
    const randomPassword = crypto.randomUUID().slice(0, 20) + "A1!";

    const customerInput: Record<string, unknown> = {
      email: normalizedEmail,
      password: randomPassword,
      acceptsMarketing: false,
    };

    if (profile?.first_name) customerInput.firstName = profile.first_name;
    if (profile?.last_name) customerInput.lastName = profile.last_name;
    if (profile?.phone) customerInput.phone = profile.phone;

    const data = await shopifyStorefrontRequest(CUSTOMER_CREATE_MUTATION, {
      input: customerInput,
    });

    const result = data?.data?.customerCreate;
    const userErrors = result?.customerUserErrors || [];
    const takenError = userErrors.find(
      (e: { code: string }) => e.code === "TAKEN" || e.code === "CUSTOMER_DISABLED"
    );

    if (result?.customer?.id) {
      const shopifyCustomerId = result.customer.id;

      // Store the Shopify GID
      await supabaseAdmin
        .from("profiles")
        .update({ shopify_customer_id: shopifyCustomerId })
        .eq("user_id", userId);

      console.log(`Shopify customer created for ${normalizedEmail} with name/phone`);

      // Try to create address if we have address data
      if (profile?.address_line1 && profile?.city) {
        try {
          // Get customer access token
          const tokenResult = await shopifyStorefrontRequest(CUSTOMER_ACCESS_TOKEN_CREATE, {
            input: { email: normalizedEmail, password: randomPassword },
          });

          const accessToken = tokenResult?.data?.customerAccessTokenCreate?.customerAccessToken?.accessToken;

          if (accessToken) {
            const address: Record<string, string> = {
              address1: profile.address_line1,
              city: profile.city,
            };
            if (profile.address_line2) address.address2 = profile.address_line2;
            if (profile.state) address.province = profile.state;
            if (profile.postal_code) address.zip = profile.postal_code;
            if (profile.country) address.country = profile.country;
            if (profile.first_name) address.firstName = profile.first_name;
            if (profile.last_name) address.lastName = profile.last_name;
            if (profile.phone) address.phone = profile.phone;

            const addrResult = await shopifyStorefrontRequest(CUSTOMER_ADDRESS_CREATE, {
              customerAccessToken: accessToken,
              address,
            });

            const addrErrors = addrResult?.data?.customerAddressCreate?.customerUserErrors || [];
            if (addrErrors.length > 0) {
              console.error(`Address creation errors: ${addrErrors.map((e: { message: string }) => e.message).join(", ")}`);
            } else {
              console.log(`Address created for ${normalizedEmail}`);
            }
          }
        } catch (addrErr) {
          // Don't fail the whole sync if address creation fails
          console.error("Address sync error:", addrErr);
        }
      }

      return new Response(JSON.stringify({ synced: true, created: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (takenError) {
      await supabaseAdmin
        .from("profiles")
        .update({ shopify_customer_id: "shopify_exists_unlinked" })
        .eq("user_id", userId);

      console.log(`Shopify customer exists for ${normalizedEmail} (marked unlinked)`);
      return new Response(JSON.stringify({ synced: true, existing_unlinked: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const errorMsg = userErrors.map((e: { message: string }) => e.message).join(", ");
    console.error(`Shopify customerCreate errors for ${normalizedEmail}: ${errorMsg}`);
    return new Response(JSON.stringify({ synced: false, reason: errorMsg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sync-shopify-customer error:", err);
    return new Response(JSON.stringify({ synced: false, reason: "internal_error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
