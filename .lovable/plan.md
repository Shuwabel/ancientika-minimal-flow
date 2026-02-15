

## Blend Product Images Seamlessly with `mix-blend-multiply`

The "Knitwear Prime" product image still shows a white rectangular background that contrasts with the beige page. We'll apply a CSS blending mode to make white pixels transparent.

### What Changes

**File: `src/components/ProductCard.tsx` (line 36)**

- Add `mix-blend-multiply` Tailwind class to the product `<img>` element
- This CSS property makes white areas blend into whatever background color is behind them, effectively making them "transparent"

### Before vs After

- **Before**: White rectangle visible around product photo
- **After**: Product sits naturally on the beige background with no visible box

### Notes

- Single CSS class addition, no structural changes
- Applies to all ProductCard instances (Featured, Shop page, etc.)
- Images with colored/styled backgrounds (like the collection tiles) are in a different component, so they won't be affected
- For best long-term results, you can also re-upload product photos with true transparent (PNG) backgrounds in Shopify

