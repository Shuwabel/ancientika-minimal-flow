

## Plan: Fix Product Cards, Category Filtering, and Add Wishlist

### Issues Identified

1. **Categories don't filter** -- The Shop page currently shows ALL products in every category. The Shopify query doesn't fetch `productType`, and the filter logic on line 26 of `Shop.tsx` literally says `return true` (no filtering).

2. **Hover overlay is too intrusive** -- The current `ProductCard` has a full-width overlay that slides up and covers the product image when hovered. This needs to be replaced with subtle icon buttons.

3. **No wishlist functionality** -- Need heart icon and cart icon on the top-right of each card, with a popover for quick add-to-cart.

---

### 1. Fix Category Filtering from Shopify

**Update `src/lib/shopify.ts`**

- Add `productType` to the GraphQL product query so Shopify returns the product type field (e.g., "Tops", "Bottoms")
- Update the `ShopifyProduct` type to include `productType: string`

**Update `src/pages/Shop.tsx`**

- Replace the `return true` filter with actual logic that matches the selected category slug against the product's `productType` (case-insensitive)
- Map collection slugs to Shopify product types: "tops" matches "Tops", "bottoms" matches "Bottoms", etc.

---

### 2. Redesign Product Card Hover Interaction

**Update `src/components/ProductCard.tsx`**

Remove the current full-overlay `AnimatePresence` block entirely. Replace with:

- **Heart icon** (top-right, upper position) -- appears on hover with a subtle fade-in. Clicking toggles wishlist state (filled/unfilled heart).
- **Cart icon** (top-right, below heart) -- appears on hover. Clicking opens a small popover/dropdown anchored to the icon, containing size/color selectors and an "Add to Cart" button.
- The product image still has the subtle `scale-105` zoom on hover (already exists).
- Icons use `absolute` positioning within the image container, not an overlay covering the image.

---

### 3. Add Wishlist Store

**New file: `src/stores/wishlistStore.ts`**

A Zustand store with `localStorage` persistence (same pattern as cart store):

- `items`: Array of product IDs in the wishlist
- `toggleItem(productId)`: Add or remove from wishlist
- `isInWishlist(productId)`: Check if a product is wishlisted
- Simple toggle -- no backend needed for now

---

### 4. Quick Add-to-Cart Popover

**New file: `src/components/QuickAddPopover.tsx`**

A Popover component (using the existing Radix popover) anchored to the cart icon on the product card:

- Shows size and color selectors (same option buttons as the current overlay, but in a compact popover)
- Filters out "Default Title" options
- Has an "Add to Cart" button
- Closes after adding to cart
- Compact design -- does not cover the product image

---

### 5. Integration Points

**Product Card layout (after changes):**

```text
+---------------------------+
|  [product image]    [heart icon] |
|                     [cart icon]  |
|                                  |
+---------------------------+
  Product Title
  Price
```

- Icons only visible on hover (desktop) or always visible (mobile)
- Heart icon: outline when not wishlisted, filled when wishlisted
- Cart icon: clicking opens the QuickAddPopover beside/below the icon

---

### Files Summary

| Action | File |
|--------|------|
| Create | `src/stores/wishlistStore.ts` |
| Create | `src/components/QuickAddPopover.tsx` |
| Update | `src/lib/shopify.ts` (add `productType` to query + types) |
| Update | `src/components/ProductCard.tsx` (replace overlay with icons + popover) |
| Update | `src/pages/Shop.tsx` (fix category filtering using `productType`) |

