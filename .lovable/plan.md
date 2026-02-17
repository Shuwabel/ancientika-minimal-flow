

# Collection Page Layout and Mobile Fix

## 1. Full-Width Collection Hero

**File: `src/pages/Shop.tsx`**

The hero banner is currently inside `<div className="container py-10">`, constraining it to max-width. Changes:

- Move the hero section outside of (above) the container wrapper
- Remove `container` wrapper from the hero; apply full-width styling
- Use `width: 100%` with no max-width restriction
- Set responsive height via `h-[clamp(300px,45vh,600px)]` instead of `aspect-[21/9]`
- Remove `rounded-sm` (full-bleed should have no border-radius)
- Keep `object-fit: cover` on the image
- Remove top padding so hero starts flush under the header
- The rest of the page content (toolbar + product grid) stays inside a container

## 2. Sticky Filter Bar Below Header

**File: `src/pages/Shop.tsx`**

The toolbar currently uses `sticky top-0 z-30`. The header is `h-16` (64px) with `sticky top-0 z-40`.

- Change the toolbar's `top-0` to `top-16` (64px) so it sticks directly below the header
- Keep `z-30` (below header's `z-40`, above product grid)
- Add `bg-background` (solid, not transparent) to prevent content showing through
- Keep `backdrop-blur-sm` and `border-b`

## 3. Mobile Quick Add Navigation Bug Fix

**File: `src/components/MobileQuickAdd.tsx`**

The issue: when the Dialog closes, the underlying `<Link>` still receives the click, navigating away. The `onOpenChange` handler on the Dialog doesn't prevent propagation.

- Wrap the Dialog's `onOpenChange` to call `stopPropagation` when closing
- Add `onClick` with `stopPropagation` on the `DialogContent` itself to prevent any click inside the dialog from bubbling to the parent `<Link>`
- Ensure the dialog overlay click (close-on-outside) doesn't bubble to the product card link

---

### Technical Details

| File | Change |
|------|--------|
| `src/pages/Shop.tsx` | Restructure: hero outside container, full-width; toolbar `top-16` |
| `src/components/MobileQuickAdd.tsx` | Add `stopPropagation` on DialogContent and overlay to prevent navigation on close |

