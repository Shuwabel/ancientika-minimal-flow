

# Shop Page Overhaul: Compact Cards, Mobile Quick-Add, Grid Resize, and Enhanced Filters

## 1. Smaller Product Images

**Current**: Product cards use `aspect-[3/4]` (tall portrait), showing fewer items on screen.

**Change**: Reduce the image aspect ratio to `aspect-square` (1:1) across all views. This makes each card more compact and lets users see more products at once without scrolling.

**Files**: `src/components/ProductCard.tsx`

---

## 2. Mobile Quick-Add Bottom Sheet

Since hover doesn't work on mobile, we need a persistent, always-visible cart icon on each product card on mobile.

**Approach**:
- Use the `useIsMobile()` hook to detect mobile
- On mobile: show a small "+" / cart icon button permanently in the bottom-right corner of each product card image
- When tapped, it opens a **Dialog (modal)** instead of the desktop Popover, containing variant selectors, "Add to Cart", and "Buy Now" buttons (reusing the existing `QuickAddPopover` logic)
- On desktop: keep the existing hover-to-reveal behavior with the Popover unchanged

**New file**: `src/components/MobileQuickAdd.tsx` -- a Dialog-based component that reuses the same variant selection and cart logic as `QuickAddPopover`

**Modified file**: `src/components/ProductCard.tsx` -- conditionally render:
  - Desktop: existing hover icons + `QuickAddPopover`
  - Mobile: always-visible "+" button + `MobileQuickAdd` dialog

---

## 3. Grid Layout Resize Toggle

Allow users to switch between different grid densities (e.g., 2-column, 3-column, 4-column on desktop; 1-column vs 2-column on mobile).

**Approach**:
- Add a row of small grid-layout icons (like the reference images) in the filter bar area of `Shop.tsx`
- Options: 2-col, 3-col, 4-col (desktop) / 1-col, 2-col (mobile)
- Store selection in local state (or `localStorage` for persistence)
- The grid `className` on the product list dynamically changes based on the selected layout

**Icons**: Use simple inline SVG grid icons (common pattern: small squares arranged in 2x2, 3x3, 4x4 patterns) or Lucide's `LayoutGrid`, `Grid2x2`, `Grid3x3` icons.

**Modified file**: `src/pages/Shop.tsx`

---

## 4. Enhanced Filter Bar (Category View)

When a category is selected, the filter section expands to include these filter options:

- **Sort by**: Featured, Best Selling, Price Low-High, Price High-Low, Newest
- **Size**: Multi-select checkboxes (S, M, L, XL, etc., derived from product variant options)
- **Price Range**: Min/Max input or predefined ranges
- **Availability**: In Stock / Out of Stock toggle

**Approach**:
- Add filter dropdowns/accordions below the search bar in `Shop.tsx`
- Sorting is applied via `useMemo` on the filtered products array
- Size filtering checks each product's `options` array for matching size values
- Price filtering compares against `priceRange.minVariantPrice.amount`
- Availability checks `availableForSale`
- A "Clear Filters" button resets all active filters
- On mobile, filters collapse into a slide-out Sheet triggered by a "Filter" button

**Modified file**: `src/pages/Shop.tsx`

---

## Technical Summary

| File | Action |
|------|--------|
| `src/components/ProductCard.tsx` | Reduce image aspect ratio; add mobile-specific always-visible cart button; conditionally render desktop hover vs mobile tap |
| `src/components/MobileQuickAdd.tsx` | **New** -- Dialog-based variant selector + Add to Cart + Buy Now for mobile |
| `src/pages/Shop.tsx` | Add grid resize toggle icons; add expanded filter bar (sort, size, price, availability); responsive filter Sheet on mobile |

