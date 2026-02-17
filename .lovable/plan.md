

# Fix Icon Styling — Black Circle Background with White Icons

## What's Wrong
The hover icons (Eye and Cart) currently render as bare black-filled SVGs with no background. The reference image shows they should have **solid black circular backgrounds with white icons inside**.

## Changes

### 1. Desktop Hover Icons (`src/components/ProductCard.tsx`, lines 92-103)

Update both icon buttons to have a black circular background with white icon color:

- Add `rounded-full bg-black` to each button
- Change icon classes from `text-foreground fill-foreground` to `text-white` (remove `fill-foreground`)
- Use `Search` (magnifying glass) icon instead of `Eye` to match the reference image style

### 2. Mobile Cart Icon (`src/components/MobileQuickAdd.tsx`, line 107-112)

Apply the same black circle + white icon styling:

- Add `rounded-full bg-black` to the trigger button
- Change icon from `text-foreground fill-foreground` to `text-white`

### Files Modified
| File | Change |
|------|--------|
| `src/components/ProductCard.tsx` | Add black circle bg + white icons on desktop hover buttons |
| `src/components/MobileQuickAdd.tsx` | Add black circle bg + white icon on mobile cart trigger |
