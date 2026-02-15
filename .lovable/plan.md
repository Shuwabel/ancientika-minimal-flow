

## Plan: Use Shopify Tags to Control Featured Products

### How It Works

You'll tag products in your Shopify admin with tags like `featured`, `best-seller`, or `new-drop`. The home page will then fetch only those tagged products instead of showing the first 4 from the full catalog.

### Managing Your Featured Products

In your Shopify admin, edit any product and add a tag (e.g., `featured`). Remove the tag to take it off the home page. No code changes needed each time.

### Technical Changes

**1. Update `src/lib/shopify.ts`**
- Add a new helper function `fetchProductsByTag(tag, first)` that calls the existing `fetchProducts` with a `tag:featured` query filter.

**2. Update `src/pages/Index.tsx`**
- Replace the current `products.slice(0, 4)` logic for featured products with a dedicated query: `fetchProducts(4, "tag:featured")`
- This becomes its own `useQuery` call separate from the full product list (which is still used for the "On Sale" section)
- If no products have the `featured` tag, the section shows "No products yet" gracefully

### Files Summary

| Action | File | What |
|--------|------|------|
| Update | `src/pages/Index.tsx` | Separate query for featured products using tag filter |

Only one file needs changing since `fetchProducts` already supports a `query` parameter.

