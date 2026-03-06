import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_DOMAIN = 'ancientika-z1ujy.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// Query allowlist — only these predefined queries can be executed
const ALLOWED_QUERIES: Record<string, string> = {
  getProducts: `
    query GetProducts($first: Int!, $query: String) {
      products(first: $first, query: $query) {
        edges {
          node {
            id
            title
            description
            handle
            productType
            availableForSale
            priceRange {
              minVariantPrice { amount currencyCode }
            }
            compareAtPriceRange {
              minVariantPrice { amount currencyCode }
            }
            images(first: 5) {
              edges { node { url altText } }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  availableForSale
                  selectedOptions { name value }
                }
              }
            }
            options { name values }
          }
        }
      }
    }
  `,
  getProductByHandle: `
    query GetProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        description
        handle
        productType
        availableForSale
        priceRange {
          minVariantPrice { amount currencyCode }
        }
        compareAtPriceRange {
          minVariantPrice { amount currencyCode }
        }
        images(first: 10) {
          edges { node { url altText } }
        }
        variants(first: 30) {
          edges {
            node {
              id
              title
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              availableForSale
              selectedOptions { name value }
            }
          }
        }
        options { name values }
      }
    }
  `,
  getCollections: `
    query GetCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image { url altText }
          }
        }
      }
    }
  `,
  getCart: `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`,
  cartCreate: `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
        }
        userErrors { field message }
      }
    }
  `,
  cartLinesAdd: `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
        }
        userErrors { field message }
      }
    }
  `,
  cartLinesUpdate: `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { id }
        userErrors { field message }
      }
    }
  `,
  cartLinesRemove: `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { id }
        userErrors { field message }
      }
    }
  `,
  cartBuyerIdentityUpdate: `
    mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart { id }
        userErrors { field message }
      }
    }
  `,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { queryId, variables } = await req.json();

    if (!queryId || typeof queryId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid queryId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const query = ALLOWED_QUERIES[queryId];
    if (!query) {
      return new Response(JSON.stringify({ error: 'Invalid query' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = Deno.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
    if (!token) {
      return new Response(JSON.stringify({ error: 'Storefront token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const shopifyResponse = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query, variables: variables || {} }),
    });

    const data = await shopifyResponse.json();

    return new Response(JSON.stringify(data), {
      status: shopifyResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
