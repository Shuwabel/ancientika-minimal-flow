
# UI Fixes: Featured Carousel, Collections, "You May Also Like", and Mobile Quick-Add

## 1. Featured Carousel -- Smaller Cards + Remove Mobile Scroll Arrows

**File: `src/pages/Index.tsx`**

- Change card widths to show ~2.5 items on mobile: `w-[38vw]` mobile, `sm:w-[30vw]`, `md:w-[23vw]`, `lg:w-[22vw]`
- Hide the left/right ChevronLeft/ChevronRight arrow buttons on mobile using `hidden md:flex` -- on mobile users just swipe naturally, no buttons needed
- Reduce gap to `gap-2 md:gap-3`

## 2. Collections Grid -- Responsive Columns

**File: `src/pages/Index.tsx`**

Change from fixed `grid-cols-3` to responsive columns that use available space:
- Mobile: `grid-cols-3` (compact)
- md: `grid-cols-4`
- lg: `grid-cols-5`
- xl: `grid-cols-6`

This ensures larger screens fill the space instead of showing only 3 wide columns.

## 3. "You May Also Like" Section -- Horizontal Carousel

**File: `src/pages/ProductDetail.tsx`**

Replace the current `grid grid-cols-2 md:grid-cols-4` layout with a horizontal scrollable carousel matching the Featured section style:
- Use a scrollable `flex` container with `overflow-x-auto snap-x snap-mandatory no-scrollbar`
- Card widths: `w-[38vw]` mobile (shows ~2.5), responsive scaling for larger screens
- No scroll arrows on mobile, optional hover arrows on desktop
- Keep the same `scroll-smooth` and `snap-start` behavior

## 4. Fix Mobile Quick-Add "+" Button Navigation Issue

**File: `src/components/MobileQuickAdd.tsx`**

The problem: clicking the "+" button opens the dialog but ALSO triggers the parent `<Link>` navigation (loading the product page). The current `e.stopPropagation()` alone isn't enough because the `<Link>` is an ancestor, not a sibling.

Fix: Add `e.preventDefault()` back alongside `e.stopPropagation()` on the trigger button. The key insight from the knowledge base is that both are needed -- `stopPropagation` prevents bubbling and `preventDefault` prevents the `<Link>` default navigation. The previous removal of `preventDefault` is what caused this regression.

```tsx
onClick={(e) => { 
  e.preventDefault(); 
  e.stopPropagation(); 
  setOpen(true); 
}}
```

## Technical Summary

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Smaller featured cards (`w-[38vw]`), hide scroll arrows on mobile, responsive collection grid columns |
| `src/pages/ProductDetail.tsx` | Convert "You May Also Like" from grid to horizontal swipeable carousel |
| `src/components/MobileQuickAdd.tsx` | Add `e.preventDefault()` back to fix navigation issue on "+" click |
