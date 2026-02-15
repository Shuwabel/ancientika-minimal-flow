

# Plan: Collections, Featured Curation, Color Variants & Inventory

## Overview

This plan covers four changes to your Shopify store: creating proper collections, curating the featured selection, adding color variants to every product, and setting inventory to 2 units per variant.

---

## 1. Create Collections & Organize Products

I'll update each product so that the **Shop page category filter** works correctly (it already filters by `productType`, which is set). However, **Shopify Collections** (which appear in the Collections grid on your homepage) need to be created.

**What I can do via tools:**
- Update product tags to ensure proper categorization

**What requires Shopify Admin (since there's no collection-creation tool):**
- Create 3 Smart Collections in Shopify Admin:
  - **Tops** -- rule: Product type equals "Tops"
  - **Bottoms** -- rule: Product type equals "Bottoms"
  - **Outerwear** -- rule: Product type equals "Outerwear"
- Delete the premade **"Home page"** collection

You can do this at: **Shopify Admin > Products > Collections**. Smart collections will auto-sort products based on product type, so new products you add later will be categorized automatically.

---

## 2. Curate the Featured Selection

Currently all 8 products have the `featured` tag. I'll remove it from 4 products so only a curated set of 4 appears in the homepage Featured section.

**Keep as featured (4 items -- one standout from each category):**
- Ethereal Linen Blouse (Tops) -- ₦45,000
- Ankara Print Tunic (Tops) -- ₦35,000
- Pleated Maxi Skirt (Bottoms) -- ₦32,000
- Structured Linen Blazer (Outerwear) -- ₦68,000

**Remove `featured` tag from:**
- Draped Silk Camisole
- Wide-Leg Linen Trousers
- Tailored Palazzo Pants
- Lightweight Kimono Wrap

This will be done by updating each product's tags via the `update_shopify_product` tool.

---

## 3. Add Color Variants

Each product currently has only a **Size** option (S, M, L, XL). I'll add a **Color** option to each product with 2-3 colors appropriate for the item, then create the corresponding size+color variant combinations.

Proposed colors per product:

| Product | Colors |
|---|---|
| Ethereal Linen Blouse | Ivory, Sand |
| Ankara Print Tunic | Indigo, Terracotta |
| Draped Silk Camisole | Black, Champagne |
| Wide-Leg Linen Trousers | Oat, Charcoal |
| Pleated Maxi Skirt | Olive, Burgundy |
| Tailored Palazzo Pants | Ivory, Black |
| Structured Linen Blazer | Sand, Navy |
| Lightweight Kimono Wrap | Sage, Terracotta |

Each product will go from 4 variants (4 sizes x 1 color) to 8 variants (4 sizes x 2 colors).

This requires:
1. Updating each product's options to include both Size and Color
2. Recreating variants for each size+color combination

---

## 4. Set Inventory (2 Stock Per Variant)

Inventory levels cannot be set through the available Shopify tools. After I create the color variants, you'll need to set inventory in **Shopify Admin > Products > [Product] > Inventory** to 2 units per variant. Alternatively, you can use the bulk editor to set all variants to 2 at once.

---

## Execution Order

1. Remove `featured` tag from 4 products (4 update calls)
2. Update all 8 products to add Color option and new variants (8 update calls + variant creation calls)
3. You create 3 Smart Collections and delete "Home page" collection in Shopify Admin
4. You set inventory to 2 per variant in Shopify Admin

---

## Technical Notes

- The Shop page already filters by `productType` so collection-based filtering will continue to work
- The homepage Featured section already queries `tag:featured` so reducing the tagged products will immediately show fewer items
- The product detail page and cart already support multi-option variants (Size + Color), so no frontend code changes are needed
- Each `update_shopify_product` call will require your approval before executing

