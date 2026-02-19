

# Shop Page & Product Detail Enhancements

## 5 Changes

### 1. Move "Shop by Category" below "Featured" on homepage
Swap the order of the two sections on the Index page so Featured appears first, then Shop by Category.

### 2. List view: name on left, price on right
In the Shop page list view, restructure the layout so the product name sits on the left and the price is pushed to the far right of the row, matching the reference image.

### 3. Bold, prominent prices across the site
Make prices more visually prominent:
- **ProductCard**: increase price font weight to `font-semibold`
- **ProductDetail**: increase price size and weight to `text-2xl font-semibold`
- **Shop list view**: price displayed as `font-semibold`

### 4. Enrich the Product Detail page
Following the reference image, add more useful information below the price and above the action buttons:
- **"Price" label** above the price value (like in reference)
- **Trust signals**: "Secure payments" and "Carbon neutral" with small icons
- **"Tax included. Shipping calculated at checkout."** text
- **Image thumbnails**: show all product images as small clickable thumbnails on the left side of the main image, allowing users to switch the displayed image

### 5. Dynamic "Back to [collection]" button
Replace the static "Back to shop" link with a dynamic one that reads the `category` query param from the referrer. When a user navigates from a collection (e.g., `/shop?category=bottoms`), the link says "Back to Bottoms" and navigates back to that filtered collection. Falls back to "Back to shop" linking to `/shop` when there's no referrer category.

## Technical Details

### File: `src/pages/Index.tsx`

Swap the order of the "Shop by Category" section (lines 214-255) and the "Featured" section (line 258). Featured comes first, then Shop by Category.

### File: `src/pages/Shop.tsx`

**List view layout (lines 380-393)**: Restructure the flex layout so the product info is `flex-1` with name on the left, and the price is a separate element aligned to the right:

```tsx
<Link to={...} className="flex items-center gap-4 border-b border-border pb-4">
  <div className="w-20 h-20 shrink-0 ...">image</div>
  <p className="text-sm font-medium truncate flex-1">{title}</p>
  <p className="text-sm font-semibold shrink-0">price</p>
</Link>
```

### File: `src/components/ProductCard.tsx`

**Price text (around line 104)**: Change from `text-xs` to `text-xs font-semibold` for the price element.

### File: `src/pages/ProductDetail.tsx`

**State**: Add `selectedImageIndex` state (default 0) for image gallery.

**Image section (lines 162-169)**: Replace single image with a layout containing:
- Left column: vertical stack of clickable thumbnail images (all product images)
- Right/main area: the currently selected large image

**Price section (lines 178-181)**: Add a "Price" label above the price, make price `text-2xl font-semibold`.

**New info section** below price, before options:
- Icon row: "Secure payments" (lock icon) and "Carbon neutral" (leaf icon)
- Small text: "Tax included. Shipping calculated at checkout."

**Back button (line 158-160)**: Read `category` from URL search params or use `useLocation` to check the referrer. Pass `category` via navigation state from Shop page links, or parse from `document.referrer`. Display "Back to {Category Name}" when available.

Implementation approach for dynamic back link:
- Use `useLocation()` to read `location.state.fromCategory`
- In Shop.tsx, pass state when linking to product: `<Link to={...} state={{ fromCategory: categoryParam, fromCategoryTitle: categoryTitle }}>`
- In ProductDetail, read this state and render accordingly

