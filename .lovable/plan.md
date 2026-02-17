

# Shop Page and Home Page Updates

## Overview
Five changes: (1) Add a liquid glass effect to the "Explore Collection" hero button, (2) completely remove the wishlist feature, (3) fix the mobile quick-add "+" button, (4) reduce featured carousel card sizes, and (5) make the collections grid more compact like the reference image.

---

## 1. Liquid Glass "Explore Collection" Button

**File: `src/pages/Index.tsx`**

Replace the current solid `Button` for "Explore Collection" with a custom-styled button that has a frosted glass / liquid glass aesthetic:
- Semi-transparent background with `bg-white/15` and `backdrop-blur-xl`
- A subtle border with `border border-white/30`
- Rounded corners, white text, and a soft shadow (`shadow-lg shadow-white/10`)
- Keep the `ArrowRight` icon

---

## 2. Remove Wishlist Entirely

Remove all wishlist-related code from:

- **`src/components/ProductCard.tsx`**: Remove the `useWishlistStore` import, the `wishlisted` state, the mobile wishlist heart button (lines 62-70), and the desktop hover heart button (lines 84-89). The desktop hover overlay should now only show the ShoppingBag quick-add icon (show on hover always, not conditionally on `wishlisted`).
- **`src/components/layout/Header.tsx`**: Remove the `useWishlistStore` import, `wishlistCount`, and the Heart icon link to `/wishlist` (lines 88-95).
- **`src/App.tsx`**: Remove the Wishlist import and the `/wishlist` route.
- **`src/pages/Wishlist.tsx`**: Delete this file.
- **`src/stores/wishlistStore.ts`**: Delete this file.

---

## 3. Fix Mobile Quick-Add "+" Button

**File: `src/components/MobileQuickAdd.tsx`**

The issue is that the `DialogTrigger` button's `onClick` calls `e.preventDefault()` and `e.stopPropagation()` but doesn't explicitly open the dialog. The `Dialog` is controlled (`open={open}`), but the trigger's `preventDefault` may be blocking the Radix trigger from toggling `open`. Fix by removing `e.preventDefault()` from the trigger's onClick (keep `e.stopPropagation()` so the parent Link doesn't navigate), or explicitly set `setOpen(true)` in the onClick.

---

## 4. Reduce Featured Carousel Card Sizes

**File: `src/pages/Index.tsx`**

Current card widths are `w-[70vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw]` which are too large.

Per the reference image, on mobile you should see ~2.5 cards. On desktop, all 4 should be visible without scrolling.

New widths:
- Mobile: `w-[40vw]` (shows ~2.5 cards)
- sm: `w-[35vw]`
- md: `w-[23vw]`
- lg: `w-[22vw]`

Also reduce the gap from `gap-4` to `gap-3` for tighter spacing matching the reference.

---

## 5. Compact Collections Grid

**File: `src/pages/Index.tsx`**

Currently the collections grid uses `aspect-[3/4]` (tall portrait) with 2 columns on mobile and 4 on desktop.

Per the reference image (3-column grid with square-ish compact tiles showing product image + title below):

- Change to a 3-column grid on all viewports: `grid-cols-3`
- Change aspect ratio to `aspect-square` for compact tiles
- Use `object-contain` and a light/neutral background so products are shown fully (like the reference)
- Move the title below the image tile (outside the overlay) instead of as an overlay on the image
- Remove the gradient overlay and description text
- Add small gap between tiles: `gap-2 md:gap-3`

---

## Technical Summary

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Glass button, smaller carousel cards, compact collection grid |
| `src/components/ProductCard.tsx` | Remove all wishlist code, keep quick-add only |
| `src/components/layout/Header.tsx` | Remove wishlist icon from header |
| `src/App.tsx` | Remove wishlist route and import |
| `src/pages/Wishlist.tsx` | Delete file |
| `src/stores/wishlistStore.ts` | Delete file |
| `src/components/MobileQuickAdd.tsx` | Fix onClick handler for dialog trigger |

