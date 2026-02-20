
# Header, Homepage & Shop Enhancements

## 6 Changes at a Glance

1. Desktop header: "Shop" nav link centered in the header (visible only on `md+`)
2. Mobile scroll-to-top fix: use `ScrollRestoration` or a scroll-to-top component in the router
3. Unified typography: "Shop by Category" heading matches "Featured" style
4. Shop by Category carousel: tiles 25% larger
5. Hamburger menu moves to the right side of the header, next to the cart icon
6. List view: image 120% larger (from `w-20 h-20` to `w-44 h-44`)

---

## Technical Details

### File: `src/App.tsx`
Add a `<ScrollToTop>` component that calls `window.scrollTo(0, 0)` on every route change. This fixes the mobile issue where navigating from the bottom of a page leaves the new page scrolled to the bottom.

```tsx
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
```

Place `<ScrollToTop />` inside `<BrowserRouter>` (or inside `AppContent`), before `<Layout>`.

---

### File: `src/components/layout/Header.tsx`

**Current layout:**
```
[Hamburger + Logo]          [Search + Cart]
```

**New layout:**
```
[Logo]     [Shop (desktop nav)]     [Search + Cart + Hamburger]
```

**Changes:**

1. **Move hamburger to the right**, placing it after the cart icon in the right icon group.

2. **Add "Shop" desktop nav link** centered in the header using absolute positioning (so it sits truly flush in the middle regardless of left/right element widths):
   ```tsx
   {/* Center: Desktop Shop nav */}
   <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
     <NavLink to="/shop">Shop</NavLink>
     {/* Optionally a dropdown with collections */}
   </nav>
   ```
   The header container gets `relative` so the absolute center nav works correctly.

3. **Remove "Shop" from the mobile sidebar** since it stays in the hamburger (which is still shown on mobile). On desktop the hamburger can be hidden since Shop is now visible in the nav. Keep hamburger visible on mobile to show the full menu (About, Contact, etc.).

   - Hamburger: `md:hidden` OR keep on both but move to right side. Given the request says "right beside the shop icon" (cart), keep it visible on all screen sizes but position it on the right.

4. The left side becomes just the logo on desktop:
   ```tsx
   <div className="flex items-center">
     <Link to="/"><span style={{ fontFamily: 'PorshaRichela' }}>ancientika</span></Link>
   </div>
   ```

5. Right side:
   ```tsx
   <div className="flex items-center gap-3">
     <SearchButton />
     <CartButton />
     <HamburgerSheet /> {/* Now here, right of cart */}
   </div>
   ```

The Sheet content (hamburger menu) still has all nav items (Home, Shop with collections, About, Contact) and stays accessible on both mobile and desktop for quick access.

---

### File: `src/pages/Index.tsx`

**"Shop by Category" heading** — change from:
```tsx
<h2 className="text-base md:text-lg font-medium tracking-wide text-center mb-10">Shop by Category</h2>
```
To match "Featured" style:
```tsx
<h2 className="uppercase font-medium tracking-[0.15em]" style={{ fontSize: "clamp(14px, 1.2vw, 18px)" }}>
  Shop by Category
</h2>
```
Also add a "View all" link to the right to match the "Featured" section's row layout.

**Tile sizing** — increase by 25%. Current `maxWidth: "160px"` becomes `maxWidth: "200px"`. The `calc((100% - 1.5rem) / 3)` stays, the max just lifts. Also bump the container from `max-w-5xl` to `max-w-6xl` to accommodate larger tiles.

---

### File: `src/pages/Shop.tsx`

**List view image** — change from `w-20 h-20` (80px) to `w-44 h-44` (176px) — approximately 120% increase:
```tsx
<div className="w-44 h-44 shrink-0 rounded-sm overflow-hidden">
```
