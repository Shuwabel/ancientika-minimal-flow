

# Center-Align Featured Section Product Images

## What Changes

Update the product card image styling in `src/components/ProductCard.tsx` so images are displayed fully visible and centered rather than cropped to fill.

## Technical Detail

**File: `src/components/ProductCard.tsx` (line 41)**

Change the `<img>` class from:
```
object-cover
```
to:
```
object-contain object-center
```

This ensures the entire product image is visible within the card and centered both horizontally and vertically, matching the reference layout where items are displayed in full without cropping.

