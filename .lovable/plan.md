

# Shopify Integration Plan

## Overview
Replace all mock product data with real Shopify Storefront API integration, and replace the current React Context cart with a Zustand-based cart that syncs with Shopify's checkout system.

## What Changes

### 1. Shopify API Layer (new file)
Create `src/lib/shopify.ts` with:
- Store domain and storefront token constants
- `storefrontApiRequest()` helper for all GraphQL calls
- Product fetching query and types (`ShopifyProduct` interface)
- Cart mutations (create, add line, update line, remove line)
- Cart helper functions with proper error handling
- `formatCheckoutUrl()` with `channel=online_store` param

### 2. Zustand Cart Store (new file, replaces React Context)
Create `src/stores/cartStore.ts` using Zustand with persist middleware:
- Replaces `src/lib/cart-context.tsx` entirely
- CartItem type uses Shopify variant IDs and line IDs
- `addItem` creates a Shopify cart on first add, then adds lines
- `updateQuantity` and `removeItem` sync with Shopify in real-time
- `syncCart` checks if cart still exists (for post-checkout cleanup)
- Persists cart state to localStorage

### 3. Cart Sync Hook (new file)
Create `src/hooks/useCartSync.ts`:
- Syncs cart on page load and when tab becomes visible
- Clears cart automatically after checkout completion

### 4. Updated Components

**`src/components/layout/Header.tsx`**
- Replace `useCart()` context with `useCartStore` from Zustand
- Cart badge reads from Zustand store

**`src/components/layout/CartDrawer.tsx`**
- Rewrite to use Zustand cart store
- Show product images from Shopify
- Checkout button opens Shopify checkout URL in new tab via `window.open`
- Loading states during cart operations

**`src/components/ProductCard.tsx`**
- Accept `ShopifyProduct` instead of mock `Product`
- Display Shopify image, title, price, currency
- Quick-add uses first available variant
- Links to `/product/[handle]` instead of `/product/[id]`

**`src/pages/Shop.tsx`**
- Fetch products from Shopify Storefront API using React Query
- Show loading skeleton while fetching
- Show "No products found" with empty state if store has no products
- Keep search/filter UI (filter client-side on fetched products)

**`src/pages/Index.tsx`**
- Fetch products from Shopify for Featured section
- Show first 4 products as featured
- On Sale section shows products with compareAtPrice
- Handle empty state gracefully (no products yet)

**`src/pages/ProductDetail.tsx`**
- Change route to use `handle` param instead of `id`
- Fetch single product by handle from Shopify Storefront API
- Display variant options (size, color) from Shopify data
- Add to cart uses Zustand store with real variant IDs

**`src/App.tsx`**
- Remove `CartProvider` wrapper (no longer needed)
- Remove `cart-context` import
- Add `useCartSync()` hook call
- Update product detail route to `/product/:handle`

### 5. Files to Remove/Deprecate
- `src/lib/cart-context.tsx` -- replaced by Zustand store
- `src/lib/mock-data.ts` -- no longer needed for products (keep `collections` array for category navigation in sidebar)

### 6. Install Dependency
- Add `zustand` package for state management

---

## Technical Details

### Shopify Constants
```
Store: yuy445-k9.myshopify.com
API Version: 2025-07
Storefront Token: cf398fb675e7cc0fe2278fc48bedf71b
```

### Route Change
- `/product/:id` becomes `/product/:handle` (Shopify uses handles for product URLs)

### Product Flow
1. Pages fetch products via `storefrontApiRequest()` with GraphQL queries
2. Products include images, variants, options, prices from Shopify
3. "Add to Cart" creates/updates a real Shopify cart via Storefront API
4. "Checkout" opens Shopify-hosted checkout in new tab

### Empty Store Handling
Since the store currently has 0 products, the UI will show "No products found" messages. The user can create products by chatting (e.g., "Create a linen tee priced at $89").

### Files Modified
- `src/App.tsx` -- remove CartProvider, add useCartSync, update route
- `src/components/layout/Header.tsx` -- use Zustand store
- `src/components/layout/CartDrawer.tsx` -- rewrite for Shopify cart
- `src/components/ProductCard.tsx` -- accept ShopifyProduct type
- `src/pages/Index.tsx` -- fetch from Shopify API
- `src/pages/Shop.tsx` -- fetch from Shopify API
- `src/pages/ProductDetail.tsx` -- fetch by handle from Shopify API
- `src/lib/mock-data.ts` -- keep only collections array

### New Files
- `src/lib/shopify.ts` -- API layer, types, cart mutations
- `src/stores/cartStore.ts` -- Zustand cart store
- `src/hooks/useCartSync.ts` -- cart sync hook

