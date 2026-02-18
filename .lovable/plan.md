

# Shop Page: Collection Title + Smooth Price Slider

## Two Changes

### 1. Move collection name above the filter sidebar
As shown in the reference image, the collection title (e.g., "Bottoms") should appear at the top of the left sidebar, above the Availability filter. It will be displayed as an uppercase heading matching the sidebar's typography style.

Currently the title only appears in the hero banner. We'll add it as the first element in the `FilterSidebar` component.

### 2. Smooth price range slider
The current slider feels stiff because it lacks CSS transitions on the thumb movement. We'll add smooth transition styles to the Slider component's thumb and track elements for a more fluid dragging experience.

## Technical Details

### File: `src/pages/Shop.tsx`

**FilterSidebar component** -- add `categoryTitle` as a heading at the top of the sidebar, before the Availability collapsible:

```tsx
<h2 className="text-sm uppercase tracking-[0.15em] font-medium text-foreground mb-4">
  {categoryTitle}
</h2>
```

This goes inside the `FilterSidebar` function, at the top of the `<div className="space-y-1">` container.

### File: `src/components/ui/slider.tsx`

**Thumb**: Add `cursor-grab active:cursor-grabbing` and smoother focus styles.

**Track/Range**: Add `transition-all duration-150` to the Range element so the filled portion animates smoothly when the thumb is repositioned.

