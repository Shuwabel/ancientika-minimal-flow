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

const CUSTOMER_UPDATE = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        phone
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

async function getCustomerAccessToken(email: string, password: string): Promise<string | null> {
  const result = await shopifyStorefrontRequest(CUSTOMER_ACCESS_TOKEN_CREATE, {
    input: { email, password },
  });
  return result?.data?.customerAccessTokenCreate?.customerAccessToken?.accessToken || null;
}

// Map common country names to ISO 3166-1 alpha-2 codes for Shopify
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "argentina": "AR", "australia": "AU", "austria": "AT", "bangladesh": "BD",
  "belgium": "BE", "brazil": "BR", "canada": "CA", "chile": "CL",
  "china": "CN", "colombia": "CO", "denmark": "DK", "egypt": "EG",
  "finland": "FI", "france": "FR", "germany": "DE", "ghana": "GH",
  "india": "IN", "indonesia": "ID", "ireland": "IE", "israel": "IL",
  "italy": "IT", "japan": "JP", "kenya": "KE", "malaysia": "MY",
  "mexico": "MX", "netherlands": "NL", "new zealand": "NZ", "nigeria": "NG",
  "norway": "NO", "pakistan": "PK", "peru": "PE", "philippines": "PH",
  "poland": "PL", "portugal": "PT", "russia": "RU", "saudi arabia": "SA",
  "singapore": "SG", "south africa": "ZA", "south korea": "KR", "spain": "ES",
  "sweden": "SE", "switzerland": "CH", "thailand": "TH", "turkey": "TR",
  "uae": "AE", "united arab emirates": "AE", "united kingdom": "GB",
  "united states": "US", "vietnam": "VN",
};

function resolveCountryCode(country: string): string {
  const trimmed = country.trim();
  // Already a 2-letter code
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;
  return COUNTRY_NAME_TO_CODE[trimmed.toLowerCase()] || trimmed;
}

function isValidState(state: unknown): state is string {
  if (!state || typeof state !== "string") return false;
  const s = state.trim().toLowerCase();
  return s.length > 0 && !s.startsWith("select");
}

function buildAddressInput(profile: Record<string, unknown>): Record<string, string> | null {
  if (!profile.address_line1 || !profile.city) return null;
  const address: Record<string, string> = {
    address1: profile.address_line1 as string,
    city: profile.city as string,
  };
  if (profile.address_line2) address.address2 = profile.address_line2 as string;
  if (isValidState(profile.state)) address.province = profile.state as string;
  if (profile.postal_code) address.zip = profile.postal_code as string;
  if (profile.country) address.country = resolveCountryCode(profile.country as string);
  if (profile.first_name) address.firstName = profile.first_name as string;
  if (profile.last_name) address.lastName = profile.last_name as string;
  if (profile.phone) address.phone = profile.phone as string;
  return address;
}

async function syncAddressAndProfile(
  email: string,
  storedToken: string,
  profile: Record<string, unknown>
) {
  const accessToken = await getCustomerAccessToken(email, storedToken);
  if (!accessToken) {
    console.error("Could not get customer access token for profile sync");
    return;
  }

  // Update customer name/phone
  const customerUpdate: Record<string, unknown> = {};
  if (profile.first_name) customerUpdate.firstName = profile.first_name;
  if (profile.last_name) customerUpdate.lastName = profile.last_name;
  if (profile.phone) customerUpdate.phone = profile.phone;

  if (Object.keys(customerUpdate).length > 0) {
    const updateResult = await shopifyStorefrontRequest(CUSTOMER_UPDATE, {
      customerAccessToken: accessToken,
      customer: customerUpdate,
    });
    const updateErrors = updateResult?.data?.customerUpdate?.customerUserErrors || [];
    if (updateErrors.length > 0) {
      console.error(`Customer update errors: ${updateErrors.map((e: { message: string }) => e.message).join(", ")}`);
    } else {
      console.log(`Customer profile updated for ${email}`);
    }
  }

  // Create address if available
  const address = buildAddressInput(profile);
  if (address) {
    const addrResult = await shopifyStorefrontRequest(CUSTOMER_ADDRESS_CREATE, {
      customerAccessToken: accessToken,
      address,
    });
    const addrErrors = addrResult?.data?.customerAddressCreate?.customerUserErrors || [];
    if (addrErrors.length > 0) {
      console.error(`Address creation errors: ${addrErrors.map((e: { message: string }) => e.message).join(", ")}`);
    } else {
      console.log(`Address created for ${email}`);
    }
  }
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
    const { userId, email, syncProfile } = await req.json();

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

    // Fetch full profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("shopify_customer_id, shopify_customer_token, phone, first_name, last_name, address_line1, address_line2, city, state, postal_code, country")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      return new Response(JSON.stringify({ synced: false, reason: "profile_fetch_error" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If syncProfile flag is set and we already have a Shopify customer, do a profile update
    if (syncProfile && profile?.shopify_customer_id?.startsWith("gid://") && profile?.shopify_customer_token) {
      try {
        await syncAddressAndProfile(normalizedEmail, profile.shopify_customer_token, profile);
        return new Response(JSON.stringify({ synced: true, updated: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Profile sync error:", err);
        return new Response(JSON.stringify({ synced: false, reason: "profile_sync_error" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Skip creation if already linked
    if (profile?.shopify_customer_id?.startsWith("gid://")) {
      return new Response(JSON.stringify({ synced: true, existing: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build customer create input
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

      // Store the Shopify GID AND the random password for future access token creation
      await supabaseAdmin
        .from("profiles")
        .update({
          shopify_customer_id: shopifyCustomerId,
          shopify_customer_token: randomPassword,
        })
        .eq("user_id", userId);

      console.log(`Shopify customer created for ${normalizedEmail}, token stored`);

      // Try to sync address if data available
      if (profile?.address_line1 && profile?.city) {
        try {
          await syncAddressAndProfile(normalizedEmail, randomPassword, profile);
        } catch (addrErr) {
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
