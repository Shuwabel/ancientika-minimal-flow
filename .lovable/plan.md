

# Shop Page Redesign: Control Bar, View Modes, and Enhanced Filters

## Overview

Rebuild the Shop/Collection page with a sticky control bar, three view modes, dynamic filter counts, and filters closed by default.

## Layout Structure

```text
+----------------------------------------------------------+
|                    HEADER (sticky, z-40)                  |
+----------------------------------------------------------+
|              HERO (50% height, title centered)            |
+----------------------------------------------------------+
| Collection Title  |  count  |  [view icons]  Sort v      | <-- sticky control bar
+----------------------------------------------------------+
|                   |                                       |
|  FILTERS (sticky) |  Product Grid (view-mode dependent)  |
|  closed by default|                                       |
|  Availability     |                                       |
|  Price            |                                       |
|  Size             |                                       |
+----------------------------------------------------------+
```

## Changes

### 1. Hero Banner

Already at `clamp(150px, 22vh, 300px)` -- no change needed. Title stays bottom-left.

### 2. Sticky Collection Control Bar

Add a new sticky bar between the hero and the sidebar+grid layout:

- **Left side**: Collection title + product count (e.g. "Bottoms -- 3 products")
- **Right side**: View mode selector buttons (3 icons) + Sort dropdown
- Sticky under header: `sticky top-16 z-30 bg-background border-b`
- Right-side controls use `ml-auto` to push to far right edge

### 3. View Mode Selector

Three view modes stored in state (`viewMode: "large" | "small" | "list"`):

| Mode  | Desktop     | Tablet      | Mobile     |
|-------|-------------|-------------|------------|
| Large | 2 columns   | 2 columns   | 1 column   |
| Small | 3 columns   | 3 columns   | 2 columns  |
| List  | full-width rows | full-width rows | stacked |

**Large view**: `grid-cols-1 md:grid-cols-2` with taller product cards
**Small view**: `grid-cols-2 md:grid-cols-3` (current default)
**List view**: `grid-cols-1` -- each item is a horizontal row with image on left (~40% width) and details on right. Row height sized so ~3.5 rows visible before scrolling.

Icons: Use `LayoutGrid` (small), `Grid2x2` (large), and `List` (list) from lucide-react. Active icon gets a visual indicator (darker/underlined).

### 4. Filters -- Closed by Default + Counts

Change initial state of all collapsible sections from `true` to `false`:
- `availabilityOpen: false`
- `priceOpen: false`  
- `sizeOpen: false`

Add dynamic counts next to availability options, computed from collection products:
- "In stock (X)" -- count of products where `availableForSale === true`
- "Out of stock (X)" -- count where `availableForSale === false`

### 5. Mobile Filters

Keep the existing Sheet-based mobile filter drawer. Add the filter toggle button to the control bar on mobile (left side, replacing the current inline position).

## Technical Details

### File: `src/pages/Shop.tsx`

**New imports**: Add `LayoutGrid, Grid2x2, List` from lucide-react.

**New state**:
- `viewMode: "large" | "small" | "list"` -- default `"small"` (current 3-col behavior)

**Changed initial state**:
- `availabilityOpen` from `true` to `false`
- `priceOpen` from `true` to `false`
- `sizeOpen` from `true` to `false`

**New computed values**:
- `inStockCount`: number of collection products with `availableForSale === true`
- `outOfStockCount`: number of collection products with `availableForSale === false`

**Grid class logic**:
```
function getGridClass(viewMode) {
  switch(viewMode) {
    case "large": return "grid-cols-1 md:grid-cols-2"
    case "small": return "grid-cols-2 md:grid-cols-3"  
    case "list": return "grid-cols-1"
  }
}
```

**List view rendering**: When `viewMode === "list"`, render each product as a horizontal card (flexbox row) instead of a standard ProductCard. Image on left (~200px height to fit ~3.5 visible), title + price + description on right.

**Sticky control bar**: New `div` between hero and main content area with `sticky top-16 z-30 bg-background/95 backdrop-blur border-b`. Contains:
- Left: collection title + count
- Right: three icon buttons for view mode + sort dropdown, using `flex items-center gap-2 ml-auto`

**Availability filter labels**: Change from "In stock" to "In stock (X)" using the computed counts.

### File: `src/components/ProductCard.tsx`

No changes needed -- the existing `aspectRatio` prop and component structure already supports different grid layouts.

### Files Modified
- `src/pages/Shop.tsx` -- control bar, view modes, filter defaults, availability counts

### No new files created
### No files deleted
