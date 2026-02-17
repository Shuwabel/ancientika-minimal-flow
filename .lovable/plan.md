

# Redesign Shop/Collection Page to Match Reference

## Overview

Rebuild the Shop page to match the reference image: reduced hero, left sidebar filters, right-side product grid with sort and count header.

## Layout Structure (Reference)

```text
+----------------------------------------------------------+
|                    HEADER (existing)                      |
+----------------------------------------------------------+
|              HERO (50% shorter, title bottom-left)        |
+----------------------------------------------------------+
|                                                          |
|  LEFT SIDEBAR        |  "91 products"    "Best selling v" |
|                      |                                    |
|  Availability  v     |  [product] [product] [product]    |
|  Price         v     |  [product] [product] [product]    |
|  Size          v     |                                    |
|  FILTER BY     v     |                                    |
|                      |                                    |
+----------------------------------------------------------+
```

## Changes

### 1. Hero Banner -- 50% Height Reduction

- Change from `clamp(300px, 45vh, 600px)` to `clamp(150px, 22vh, 300px)`
- Keep title bottom-left, full-width, object-cover
- Remove product count from hero (it moves to the grid header)

### 2. Replace Sticky Toolbar with Sidebar + Grid Header Layout

**Remove entirely**: The current sticky toolbar with category selector, filter button, grid toggle, and collapsible filter panel.

**New desktop layout** (two-column):
- **Left sidebar** (~200px wide, sticky): Collapsible sections stacked vertically:
  - **Availability** -- chevron toggle, reveals "In stock" / "Out of stock" checkboxes
  - **Price** -- chevron toggle, reveals a dual-thumb range slider (using existing Slider component) with min/max currency labels
  - **Size** -- chevron toggle, reveals size toggle buttons (only sizes present in current collection)
  - **FILTER BY** -- chevron toggle (for any additional future filters), or a clear-all button
- **Right content area**: 
  - **Header row**: product count on left ("X products"), sort dropdown on right ("Best selling")
  - **Product grid**: 3 columns on desktop, 2 on mobile

**Mobile layout**: Sidebar collapses into a Sheet/drawer triggered by a filter button; sort dropdown and product count remain visible above the grid.

### 3. Filter Functionality

**Availability**: Two checkboxes -- "In stock" and "Out of stock". Filters by `availableForSale`.

**Price**: Dual-thumb Slider component. Min = 0, Max = dynamically computed highest price in collection. Instant filtering on drag. Display formatted currency values.

**Size**: Only show sizes that exist in current collection products. Multiple selection via toggle buttons.

**Sort options** (renamed):
- Best selling (default/featured)
- Newest
- Price: Low to High
- Price: High to Low

### 4. Product Grid

- Desktop: fixed 3 columns
- Mobile: 2 columns
- Centered, consistent spacing
- No scroll snapping
- Existing hover behavior preserved

### 5. State Changes

- Remove `gridCols` state and `getGridClass` function
- Remove `GRID_OPTIONS` constant
- Replace `minPrice`/`maxPrice` string states with `priceRange: [number, number]` numeric state
- Add computed `maxPriceInCollection` from products
- Add `outOfStockOnly` boolean state
- Add collapsible open/close state for each sidebar section

## Technical Details

### File: `src/pages/Shop.tsx` (major rewrite)

**Imports**: Add `Collapsible, CollapsibleTrigger, CollapsibleContent` from ui, `Slider` from ui. Remove `SlidersHorizontal, LayoutGrid, Grid3x3` icons. Remove `Sheet` (desktop sidebar replaces it; keep Sheet for mobile only).

**Constants**:
- Update `SORT_OPTIONS` to: Best selling, Newest, Price low-high, Price high-low (remove Alphabetical)
- Remove `GRID_OPTIONS` and `getGridClass`

**State**:
- Remove `gridCols`, `filtersOpen`
- Replace `minPrice`/`maxPrice` strings with `priceRange: [number, number]`
- Add `showOutOfStock` boolean
- Add `availabilityOpen`, `priceOpen`, `sizeOpen` booleans for collapsible sections

**Computed values**:
- `maxPriceInCollection`: derived from filtered-by-category products, used as slider max
- `availableSizes`: filter to only sizes in current category, not all products

**Hero**: Reduce height to `clamp(150px, 22vh, 300px)`, remove product count from overlay.

**Body layout**: 
```
<div className="container py-8">
  <div className="flex gap-8">
    {/* Sidebar - hidden on mobile */}
    <aside className="hidden md:block w-[200px] shrink-0 sticky top-24 self-start space-y-4">
      {/* Collapsible: Availability */}
      {/* Collapsible: Price (with Slider) */}
      {/* Collapsible: Size */}
      {/* Clear filters button */}
    </aside>
    
    {/* Main content */}
    <div className="flex-1">
      {/* Header: count + sort */}
      <div className="flex items-center justify-between mb-6">
        <span>X products</span>
        <Select>Best selling</Select>
      </div>
      {/* Grid: 3 cols desktop, 2 mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        ...products
      </div>
    </div>
  </div>
</div>
```

**Mobile**: Show a filter button that opens a Sheet with the same filter content. Sort dropdown stays visible above grid.

### No new files created
### No files deleted

### Dependencies already installed
- `@radix-ui/react-slider` -- for price range slider
- `@radix-ui/react-collapsible` -- for sidebar accordion sections

