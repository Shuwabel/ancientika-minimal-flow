

# Fix: Center-Align Content, Not Images

## Problem

1. **Shop by Category**: Images are shrunk to 75% and centered inside tiles (`w-3/4 h-3/4 object-contain`). They should fill the entire tile (`w-full h-full object-cover`). The grid container itself is already centered -- that part is fine.

2. **Featured carousel**: Items are left-aligned using `flex` with left padding. When there are fewer items than fill the row, empty space appears on the right.

3. **You May Also Like carousel** (ProductDetail page): Same left-alignment issue.

## Changes

### 1. `src/pages/Index.tsx` -- Shop by Category tiles

Revert the image sizing back to full-tile coverage:
- Change `w-3/4 h-3/4 object-contain` to `w-full h-full object-cover`
- Remove the `flex items-center justify-center` from the tile wrapper (no longer needed when image fills the tile)

### 2. `src/pages/Index.tsx` -- FeaturedCarousel

Change the flex container from left-aligned to center-aligned:
- Add `justify-center` to the flex container so items spread from center
- Keep `overflow-x-auto` so it still scrolls when items exceed viewport width
- This means when there are few items, they sit centered; when many, they scroll naturally

### 3. `src/pages/ProductDetail.tsx` -- You May Also Like

Same fix as Featured:
- Add `justify-center` to the flex container so items populate from center outward

## Files Modified

- **`src/pages/Index.tsx`** -- fix tile images to fill tiles; add `justify-center` to Featured carousel
- **`src/pages/ProductDetail.tsx`** -- add `justify-center` to You May Also Like carousel
