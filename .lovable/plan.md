

# UI Polish + Product Population Plan

## Important Note on Test Products

I don't have write access to your Shopify store (it was connected by another team member). You'll need to create the test products yourself through the Shopify admin panel. I'll provide you with a direct link. For each category, create at least 5 products with:
- **Product type** set to "Tops", "Bottoms", "Outerwear", or "Accessories" (this enables category filtering)
- Prices in **NGN (Nigerian Naira)** -- update your store currency in Shopify Settings > Store Currency
- At least one product image each
- Variants for size (XS, S, M, L, XL) where applicable

## UI Changes

### 1. Footer Mobile Layout Fix (`src/components/layout/Footer.tsx`)
The screenshot shows Shop and Info stacked vertically on mobile. Fix by making the links section a 2-column grid on mobile:
- Change the outer grid from `grid-cols-1 md:grid-cols-4` to `grid-cols-2 md:grid-cols-4`
- Brand section stays `md:col-span-2` on desktop but on mobile the Shop and Info columns sit side by side

### 2. Hero Logo: Use Mocha Brown Logo (`src/pages/Index.tsx`)
- Replace `import mainLogo from "@/assets/ANCIENTIKA_MAIN_LOGO.png"` with `import mainLogo from "@/assets/Ancientika_logo_mocha_brown.png"`
- The mocha brown logo has better visibility against the light beige background

### 3. Hero Caption Update (`src/pages/Index.tsx`)
- Replace `"Premium, defined by less."` with `"Your presence, refined."`
- Style it with `font-bold text-xl md:text-2xl tracking-wide` for a bold, impactful feel
- Remove the `text-muted-foreground` class so it reads stronger

### 4. Naira Currency Display (`src/components/ProductCard.tsx` + `src/pages/ProductDetail.tsx`)
- Update the currency symbol logic: where it currently does `currency === 'USD' ? '$' : currency`, change to handle NGN with the Naira sign (₦)
- Format: `currency === 'USD' ? '$' : currency === 'NGN' ? '₦' : currency`
- Apply this in both ProductCard and ProductDetail

### 5. Collections Background Image (`src/pages/Index.tsx`)
- Use the AI image generation API to generate a warm, minimal, earthy-toned background image suitable for the collections section
- Save it to `src/assets/collections-bg.jpg`
- Apply it as a background to the Collections section with a subtle overlay for text readability
- Each collection card will sit on top of this atmospheric background

---

## Technical Details

### `src/components/layout/Footer.tsx`
- Line 8: Change `grid-cols-1 md:grid-cols-4` to `grid-cols-2 md:grid-cols-4`
- This makes Shop and Info columns sit side by side on mobile, with the brand section spanning full width on mobile via adding `col-span-2 md:col-span-2`

### `src/pages/Index.tsx`
- Line 5: Change logo import to `Ancientika_logo_mocha_brown.png`
- Line 53-54: Replace caption text and styling
- Lines 91-106: Wrap Collections section with background image and overlay

### `src/components/ProductCard.tsx`
- Update currency display: add NGN/₦ handling

### `src/pages/ProductDetail.tsx`
- Same currency display update for product detail page

### Image Generation
- Generate a warm, minimal background using the AI image API with a prompt like: "Warm minimalist abstract texture, soft earthy tones of mocha brown and beige, linen fabric texture, subtle grain, no text, no objects, fashion brand aesthetic"
- Save to project and import in Index.tsx

