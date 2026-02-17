

# Search Overlay — Top-Pinned with Backdrop Blur

## What Changes

The search panel needs to match the reference: a full-width search bar pinned to the very top of the viewport, with the page content visible and blurred underneath.

## Visual Differences from Current

| Aspect | Current | Target (Reference) |
|--------|---------|---------------------|
| Panel position | Centered with `mt-16` gap | Pinned to top, no gap |
| Backdrop | Dark semi-transparent (`bg-foreground/60`) | Lighter blur, page content visible |
| Panel shape | Rounded card with border | Full-width bar, no rounded corners on top |
| Search input | Inside a bordered card panel | Full-width input bar at viewport top edge |
| Results panel | Attached below input inside same card | Drops down from the input bar |

## Implementation

### File: `src/components/PredictiveSearch.tsx`

1. **Backdrop**: Change from `bg-foreground/60 backdrop-blur-sm` to `bg-black/40 backdrop-blur-md` for a softer, more transparent overlay that lets page content show through with blur.

2. **Panel positioning**: Remove `mt-16` and `rounded-lg`. Pin the search panel to the top of the viewport with no gap. Use `w-full` with no max-width on the outer search bar wrapper.

3. **Structure split**: Separate the search input bar (full-width, top-pinned) from the results dropdown (centered, max-width container below).
   - Search input bar: full viewport width, solid background, sits at `top: 0`
   - Results dropdown: centered container (max-width 1000px) drops below the input bar

4. **Input bar styling**: Clean horizontal bar with the search icon, input field, and close button. Solid `bg-background` background. Subtle bottom border.

5. **Results panel**: Remains as the existing two-column desktop / stacked mobile layout, but drops down from the full-width input bar with a contained max-width and slight shadow.

6. **Animation**: Slide down from top (`y: -10` to `y: 0`) instead of the current fade approach.

### No other files are modified. Only `src/components/PredictiveSearch.tsx` changes.
