

# Restore Hamburger Menu + Fix Tablet Spacing

## Two Changes

### 1. Hamburger Menu with Context-Aware Sidebar (`Header.tsx`)

Restore the hamburger menu button on the left side of the header. The inline nav links currently in the header bar will be removed and moved into a sidebar (Sheet) that slides in from the left.

**Header bar layout:**
- Left: Hamburger icon (Menu from lucide-react) -- always visible on all screen sizes
- Center: Ancientika logo
- Right: Search + Cart icons

**Sidebar behavior (context-aware):**
- On Home page (`/`): Shows only "Shop" link
- On Shop page (`/shop`): Shows "Home" link, then "Shop" with an expandable list of categories (All, Tops, Bottoms, Outerwear, Accessories)
- Clicking any link navigates and closes the sidebar
- Uses Sheet component (already exists) sliding from left
- For the categories list on the shop page, use a simple collapsible toggle with `ChevronDown` icon and state

### 2. Fix Tablet Empty Space (`Index.tsx`)

The hero section currently uses `min-h-[85vh]` which creates excessive whitespace below the featured products on tablet viewports. Fix by removing the fixed min-height and letting the content define the section height naturally.

- Change `min-h-[85vh]` to just remove it or use a smaller value
- Reduce top padding on tablet to tighten the layout
- Reduce the gap between hero content and featured grid (`mt-12 md:mt-16` to `mt-8 md:mt-12`)
- Reduce bottom padding on the hero section

---

## Technical Details

### `src/components/layout/Header.tsx`
- Import `Menu` from lucide-react, `Sheet`/`SheetContent`/`SheetTrigger`/`SheetTitle` from `@/components/ui/sheet`
- Add `useState` for sheet open state and a separate state for categories expanded toggle
- Remove the inline `<nav>` block (lines 27-69)
- Add Sheet with Menu trigger button on the left side of the header
- Inside SheetContent (side="left"): render context-aware nav with warm brown styling
- Use `useLocation` (already imported) to detect route, `useNavigate` (already imported) for category navigation
- Close sheet on any link click by setting open state to false

### `src/pages/Index.tsx`
- Line 31: Change `min-h-[85vh]` to remove it entirely, letting content flow naturally
- Adjust spacing: reduce `pt-20 md:pt-28` to `pt-16 md:pt-24` and `mt-12 md:mt-16` to `mt-8 md:mt-12`

