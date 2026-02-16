
# Shop Page Toolbar Reorganization and Category Hero Header

## Overview
Three changes: (1) move search icon to the right side next to grid selector, (2) replace the sort dropdown in the main bar with a category selector and move category out of the filter dropdown, (3) add a hero banner image when a category is selected (like the reference screenshot showing a full-width category image with the category name overlaid).

## Changes

### 1. Toolbar reorder (src/pages/Shop.tsx)
Current order: `[Search] [Sort: Featured] [Filters] [spacer] [Grid toggle]`

New order: `[Category selector] [Filters] [spacer] [Search icon] [Grid toggle]`

- The **Category** dropdown moves to where "Featured" sort currently sits in the main bar
- The **Sort** dropdown moves inside the filter dropdown (it was already duplicated there)
- The **Search** icon moves to the right, just before the grid toggle
- Remove the duplicate Category selector from inside the filter dropdown (since it's now in the main bar)

### 2. Category hero banner (src/pages/Shop.tsx)
When a specific category is selected (not "all"), display a full-width hero image banner above the toolbar:
- Use the collection's `image.url` from the Shopify collections data
- Overlay the category title in large text at the bottom-left (like the reference image showing "T-SHIRTS")
- Show product count below the banner
- If no collection image exists or "all" is selected, fall back to the current simple text heading

### 3. Fix mobile grid toggle (src/pages/Shop.tsx)
The mobile grid toggle currently maps the second button to `gridCols(4)` but `getGridClass` treats non-2 values as `grid-cols-1` on mobile. This is confusing. Fix it so the mobile toggle uses a clearer state (e.g., 1 vs 2 columns mapped properly).

## Technical Details

### File: `src/pages/Shop.tsx`

**Hero banner section** (replaces the current `motion.h1` title):
- Find the active collection from `collections` array matching `categoryParam`
- If collection has an image, render a full-width banner (`aspect-[21/9]` or similar) with dark overlay and category title text
- Show `"{count} products"` text below the banner
- When `categoryParam === "all"`, show the simple "All Products" heading as before

**Toolbar reorder**:
- Remove sort `Select` from main bar (lines 297-307)
- Move category `Select` to that position
- Move search icon/input to after the spacer `div`, before grid toggle
- In the desktop filter dropdown, replace the category selector with the sort selector
- In the mobile `FilterContent`, keep sort but remove category (since it's in the main bar now)

**Mobile grid fix**:
- Change the second mobile grid button to use a value that maps to 1 column properly (store as a separate mobile-friendly state or just use `gridCols === 1` check)
