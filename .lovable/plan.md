
# Home Page Restructure, Navigation Cleanup, and Shop Dropdown

## Overview
Combining all approved changes: restructure the home page sections, remove About and Contact from the header nav, add a sticky newsletter banner on the home page, and replace Shop category pills with a dropdown.

---

## 1. Header Navigation (`src/components/layout/Header.tsx`)

- Remove both **About** and **Contact** from the `navLinks` array
- Only "Shop" remains in the top nav (About and Contact are still accessible via footer)

---

## 2. Home Page (`src/pages/Index.tsx`)

### Section reorder and hero adjustment:

**New section order:**
1. **Hero** -- keep 85vh but shift content upward (`items-start pt-20 md:pt-28`) so the logo, title, tagline, and button sit higher, leaving room below
2. **Featured products** -- placed directly after the hero content inside the same hero section, filling the space below the CTA button
3. **Sticky Newsletter Banner** -- a thin, always-visible bar that stays fixed while scrolling (only on the home page). Shows "Join our newsletter" text with a subtle call-to-action. Positioned below the header (`top-16`) with `sticky` positioning and a high `z-index`
4. **Collections Grid** -- unchanged
5. **On Sale** -- moved up from its current position
6. **Philosophy (expanded)** -- moved to the bottom, expanded with 3 informative pillars: Craftsmanship, Sustainability, and Timelessness
7. **Newsletter form** -- stays at the very bottom as-is

### Sticky Newsletter Banner details:
- A slim bar (`py-2`) with `sticky top-16 z-30` positioning so it sticks right below the header
- Background uses the accent color for contrast
- Contains scrolling/marquee-style text: "Join our newsletter -- First access to new drops and exclusive offers"
- CSS animation for horizontal text scroll (infinite marquee effect)
- Only rendered inside `Index.tsx`, so it only appears on the home page

---

## 3. Shop Page (`src/pages/Shop.tsx`)

### Category pills replaced with dropdown:
- Replace the horizontal row of category buttons (lines 62-87) with a Radix `Select` dropdown
- Import `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
- Options: "All", plus each collection name
- On value change, updates `searchParams` for category filtering
- Price filter pills remain unchanged

---

## Technical Details

### Files to modify:

1. **`src/components/layout/Header.tsx`**
   - Change `navLinks` array to only contain `{ label: "Shop", href: "/shop" }`

2. **`src/pages/Index.tsx`**
   - Hero section: change `items-center justify-center` to `items-start justify-start pt-20 md:pt-28` and place Featured grid inside the hero below the CTA
   - Add a sticky newsletter banner element after the hero section with CSS marquee animation
   - Reorder remaining sections: Collections, On Sale, Philosophy (expanded), Newsletter form
   - Add inline `@keyframes marquee` style or a Tailwind `animate-marquee` class for the scrolling text

3. **`src/pages/Shop.tsx`**
   - Import Select components from `@/components/ui/select`
   - Replace lines 62-87 (category pills) with a Select dropdown
   - On `onValueChange`, call `setSearchParams` with selected category (or clear params for "all")

4. **`src/index.css`** (optional)
   - Add a `marquee` keyframe animation if not using inline styles:
     ```
     @keyframes marquee {
       0% { transform: translateX(0); }
       100% { transform: translateX(-50%); }
     }
     ```
