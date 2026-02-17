

# Product Interaction and Scroll Behavior Refinement

## 1. Remove Scroll Snapping Globally

Remove all snap classes from horizontal scroll containers.

**Files affected:**
- `src/pages/Index.tsx` -- Remove `snap-x snap-mandatory` from Featured carousel container and `snap-start` from card wrappers
- `src/pages/ProductDetail.tsx` -- Remove `snap-x snap-mandatory` from "You May Also Like" container and `snap-start` from card wrappers
- Keep `no-scrollbar` CSS utility (it hides scrollbars, not snap behavior)

## 2. Redesign Desktop Hover Interaction (ProductCard)

**File: `src/components/ProductCard.tsx`**

Replace the current full-overlay with buttons approach. New hover behavior:

- Show only two small icon buttons on hover (no overlay blocking the image)
- **Eye icon** (Quick View) -- top-right corner
- **Cart icon** (Quick Add) -- directly below the eye icon, vertically aligned
- Icons: solid black fill, no white circular background
- Smooth 200ms fade-in via framer-motion (already in place)
- The overlay will be minimal/transparent so the product image link remains clickable
- Each icon uses `preventDefault()` + `stopPropagation()` to avoid navigation

**Click behaviors:**
- Clicking the product image navigates to the product page (default Link behavior, not blocked)
- Clicking Eye icon opens QuickViewModal (full product preview)
- Clicking Cart icon opens a new QuickAddDialog (small dialog with size/variant selection + Add to Cart + Buy Now)

## 3. Create Desktop Quick Add Dialog

**New file: `src/components/DesktopQuickAdd.tsx`**

A small Dialog (smaller than QuickViewModal) triggered by the cart icon on desktop hover. Contains:
- Size selection buttons
- Variant selection (if applicable)
- Add to Cart button
- Buy Now button
- Close button (X) built into DialogContent
- Closes on outside click

Reuses the same pattern as `MobileQuickAdd.tsx` but as a controlled Dialog (open/onOpenChange props instead of internal trigger).

## 4. Redesign Mobile Interaction

**File: `src/components/MobileQuickAdd.tsx`**

Replace the Plus icon with a Cart (ShoppingBag) icon:
- Position: top-right of product image
- Styling: solid black fill, no white background, minimal design
- Same click behavior: opens the quick-add Dialog with size/variant/add-to-cart/buy-now
- `preventDefault()` + `stopPropagation()` preserved

## 5. Update ProductCard to Wire Everything Together

**File: `src/components/ProductCard.tsx`**

- Remove the full dark overlay (`bg-black/40`) and large centered buttons
- On desktop hover: render two small icon buttons (Eye + Cart) positioned absolutely in top-right, vertically stacked
- Eye icon click opens QuickViewModal (existing)
- Cart icon click opens new DesktopQuickAdd dialog
- On mobile: render the updated MobileQuickAdd (cart icon, not plus)
- The `<Link>` wrapping the image remains fully clickable for navigation

## Technical Summary

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Remove `snap-x snap-mandatory` and `snap-start` classes |
| `src/pages/ProductDetail.tsx` | Remove `snap-x snap-mandatory` and `snap-start` classes |
| `src/components/ProductCard.tsx` | Replace full overlay with two small hover icons (Eye + Cart); wire up DesktopQuickAdd |
| `src/components/MobileQuickAdd.tsx` | Change Plus icon to ShoppingBag icon, solid black styling |
| `src/components/DesktopQuickAdd.tsx` | New small Dialog for desktop quick-add with size/variant/cart/buy-now |

