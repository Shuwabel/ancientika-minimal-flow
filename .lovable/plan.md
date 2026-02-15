

## Pull Collection Images from Shopify

Currently, the four category tiles on the home page are hardcoded in `src/lib/mock-data.ts` with no images. We'll replace them with real Shopify collections fetched via the Storefront API, including their cover images.

### Prerequisites

You'll need to create collections in your Shopify admin (if you haven't already) and assign an image to each one. The collection names should match your categories (Tops, Bottoms, Outerwear, Accessories).

### What Changes

**1. Add a collections query to `src/lib/shopify.ts`**
- Add a new GraphQL query `COLLECTIONS_QUERY` that fetches collections with their `id`, `title`, `handle`, `description`, and `image { url altText }`
- Add a `fetchCollections(first)` helper function
- Add a `ShopifyCollection` TypeScript interface

**2. Update `src/pages/Index.tsx`**
- Replace the static `collections` import with a `useQuery` call to `fetchCollections()`
- Render each collection tile with its Shopify image as a background
- Show skeleton loaders while collections load
- Link each tile to `/shop?category={handle}` using the collection handle

**3. Clean up `src/lib/mock-data.ts`**
- Remove the hardcoded `collections` array (no longer needed)

### Technical Details

**GraphQL Query:**
```graphql
query GetCollections($first: Int!) {
  collections(first: $first) {
    edges {
      node {
        id
        title
        handle
        description
        image {
          url
          altText
        }
      }
    }
  }
}
```

**Collection tile rendering:**
Each tile will display the collection image as a cover background with a gradient overlay at the bottom for the text, keeping the current aspect ratio and hover effects.

### Files Summary

| Action | File | What |
|--------|------|------|
| Update | `src/lib/shopify.ts` | Add collections query + fetch helper |
| Update | `src/pages/Index.tsx` | Fetch and render real collections with images |
| Update | `src/lib/mock-data.ts` | Remove hardcoded collections array |

