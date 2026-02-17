

# Center-Align the Shop by Category Grid

## Problem

The Shop by Category grid uses CSS Grid (`grid grid-cols-3 ...`), which places items left-to-right. When the last row has fewer items than columns, those items sit on the left side, leaving empty space on the right -- unlike the Featured carousel which centers its items beautifully.

## Solution

Replace the CSS Grid with a flexbox layout that uses `justify-center` and `flex-wrap`, matching the same center-alignment approach that works so well in the Featured section. Each tile gets a fixed responsive width to maintain the square proportions and column density.

## Changes

### `src/pages/Index.tsx` -- Shop by Category grid

For both the skeleton loader and the actual collection grid:

- Change from `grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4` to `flex flex-wrap justify-center gap-3 md:gap-4`
- Give each tile a fixed width that mimics the current column behavior:
  - On mobile (3 columns): `calc((100% - 1.5rem) / 3)` -- roughly 30% of container
  - This naturally increases columns as the container widens, capping at ~6 on desktop thanks to the `max-w-5xl` container
- The `max-w-5xl mx-auto` container stays, keeping everything bounded and centered

This ensures that when a row has fewer items than can fit, they center rather than hug the left edge -- identical behavior to how the Featured section works.

## Files Modified

- **`src/pages/Index.tsx`** -- convert category grid from CSS Grid to centered flex-wrap layout

