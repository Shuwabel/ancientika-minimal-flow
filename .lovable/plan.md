

## Plan: Add Wishlist Page, Fix Size Guide, and Fix Quick Add Button

### 1. Create Wishlist Page (`src/pages/Wishlist.tsx`)

A dedicated page at `/wishlist` that displays all wishlisted products:

- Fetches all Shopify products, then filters to only those whose IDs are in the wishlist store
- Displays products in a grid using the existing `ProductCard` component
- Shows an empty state message with a link to the shop when no items are saved
- Page title: "Wishlist" with the same minimal styling as other pages

### 2. Add Wishlist Icon to Header (`src/components/layout/Header.tsx`)

- Add a Heart icon next to the Search and Cart icons in the top-right
- Show a count badge (same style as cart badge) when there are wishlisted items
- Links to `/wishlist`

### 3. Add Wishlist Route (`src/App.tsx`)

- Import the new Wishlist page and add a route at `/wishlist`

### 4. Fix Size Guide on Product Detail

**Problem:** The `PRODUCT_BY_HANDLE_QUERY` in `shopify.ts` is missing `productType`, so the product detail page never knows the category, and the Size Guide buttons never appear.

**Fix in `src/lib/shopify.ts`:** Add `productType` field to the `PRODUCT_BY_HANDLE_QUERY` (line ~113, after `availableForSale`).

**Fix in `src/lib/size-data.ts`:** Update `getCategoryFromProductType` to handle singular forms -- e.g., "Top" should match "tops". A simple check: if the type without trailing "s" matches a known category prefix, return that category.

### 5. Fix Quick Add Popover on Product Cards

**Problem:** The shopping bag button inside `QuickAddPopover` calls `e.preventDefault()` and `e.stopPropagation()`, which prevents the Radix `PopoverTrigger` from receiving the click event to open the popover.

**Fix in `src/components/ProductCard.tsx`:** Remove `e.preventDefault()` and `e.stopPropagation()` from the shopping bag button's `onClick`. Instead, wrap the entire action icons area in a `div` with `onClick={e => e.preventDefault()}` to prevent the parent `Link` from navigating when interacting with the icons.

---

### Files Summary

| Action | File | What |
|--------|------|------|
| Create | `src/pages/Wishlist.tsx` | Wishlist page showing saved products |
| Update | `src/App.tsx` | Add `/wishlist` route |
| Update | `src/components/layout/Header.tsx` | Add heart icon with badge linking to wishlist |
| Update | `src/lib/shopify.ts` | Add `productType` to single-product query |
| Update | `src/lib/size-data.ts` | Handle singular product types (e.g., "Top") |
| Update | `src/components/ProductCard.tsx` | Fix click propagation so quick-add popover works |
