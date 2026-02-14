

# Navigation Overhaul, Newsletter Banner, and Color Fix

## Summary

Three main changes: make the navbar context-aware with a category dropdown, move the newsletter banner directly under the navbar, and restore the warm brown color palette.

---

## 1. Color Revert

The current CSS variables in `index.css` already use the brown/mocha palette (hue 25-30). The newsletter banner currently uses `bg-accent` (mocha brown). If any elements have drifted, we will ensure all UI elements consistently use the warm brown tokens already defined. No major color changes needed -- the brown vibe is intact in the CSS, we just need to make sure all components reference it properly.

---

## 2. Newsletter Banner -- Move to Right Below Navbar

Currently the sticky banner sits between the Hero and Collections sections in `Index.tsx`. It will be:

- Moved to the very top of the Index page content (before the Hero section)
- Kept `sticky top-16 z-30` so it sticks right below the 64px (h-16) navbar
- Only visible on the home page (stays in `Index.tsx`, not in Layout)
- Continues scrolling marquee animation as-is

---

## 3. Context-Aware Navbar (`Header.tsx`)

The navbar will behave differently depending on which page the user is on:

### On Home Page (`/`):
- Shows only **Shop** link (as it does now)

### On Shop Page (`/shop` or `/shop?category=...`):
- Shows **Home** link above/before Shop
- **Shop** becomes a dropdown trigger that opens a menu with all categories: Tops, Bottoms, Outerwear, Accessories
- Clicking a category navigates to `/shop?category=slug`
- This dropdown works on all platforms (PC, tablet, mobile) -- will use a Radix DropdownMenu component that works with both click and touch

### Implementation approach:
- Use `useLocation()` from react-router-dom to detect current route
- Conditionally render "Home" link when on `/shop`
- Replace the plain "Shop" link with a DropdownMenu trigger on the shop page
- On the home page, "Shop" remains a simple link
- Mobile nav also gets the same treatment -- no separate hamburger needed since the dropdown handles it
- Remove the hamburger menu toggle since the nav is simple enough (Home + Shop dropdown)

---

## 4. Shop Page Cleanup

Since the navbar now has the category dropdown, the category Select dropdown in the Shop page filters section stays as a secondary filter (useful when a user is already on the page and wants to filter without scrolling up). Both the navbar dropdown and the shop page dropdown control `searchParams.category`.

---

## Technical Details

### Files to modify:

1. **`src/components/layout/Header.tsx`**
   - Import `useLocation` from react-router-dom
   - Import `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` from `@/components/ui/dropdown-menu`
   - Import `collections` from `@/lib/mock-data`
   - Import `useNavigate` for category navigation
   - Detect if on shop page: `const isShopPage = location.pathname === "/shop"`
   - When `isShopPage`: render "Home" link to `/`, and "Shop" as a DropdownMenu with category items
   - When on home: render "Shop" as a simple link (current behavior)
   - Remove hamburger menu -- replace with always-visible nav links (only 1-2 items, fits on any screen)
   - Both desktop and mobile show the same nav (no `hidden md:flex` split)

2. **`src/pages/Index.tsx`**
   - Move the sticky newsletter banner div (lines 52-62) to before the Hero section (line 19), so it appears right below the navbar
   - Everything else stays the same

