

# Improve Font Readability Across the Website

## Problem
Text across the site is hard to read because of three compounding factors:
- The `muted-foreground` color is too washed out (45% lightness)
- Many text elements use `opacity-70` or `opacity-80`, reducing contrast further
- Heading weight (500) is too close to body text weight, making the hierarchy unclear
- Glass surfaces behind text reduce readability

## Changes

### 1. Strengthen color tokens (`src/index.css`)

**Light mode:**
- `--muted-foreground`: change from `30 6% 45%` to `30 8% 30%` (darker, more readable)
- `--foreground`: keep as-is (already dark enough)

**Dark mode:**
- `--muted-foreground`: change from `30 8% 55%` to `30 10% 70%` (brighter, easier to read)

**Headings:**
- Bump heading weight from `500` to `600`

### 2. Remove excessive opacity from text (`src/pages/Index.tsx`)
- Newsletter banner marquee: keep `text-xs` but remove any opacity reduction
- Newsletter popup: change `opacity-70` on subtitle/label to `opacity-90`
- Newsletter section: change `opacity-70` and `opacity-80` to `opacity-90`
- Philosophy section body text: already uses `text-muted-foreground` which will improve with the token change

### 3. Remove excessive opacity from Footer (`src/components/layout/Footer.tsx`)
- Footer headings: change `opacity-70` to `opacity-90`
- Footer links: change `opacity-80` to `opacity-90`
- Copyright text: change `opacity-50` to `opacity-70`

### 4. About page (`src/pages/About.tsx`)
- Body text currently uses `text-muted-foreground` which will automatically improve with the token fix
- "Our Values" heading: change `opacity-70` (via `text-muted-foreground`) -- no extra opacity used, so the token fix handles it

### 5. Contact page (`src/pages/Contact.tsx`)
- Labels use `text-muted-foreground` -- handled by token fix
- Subtitle uses `text-muted-foreground` -- handled by token fix

### 6. Header nav (`src/components/layout/Header.tsx`)
- Sidebar menu items use `text-muted-foreground` -- handled by token fix
- Shop dropdown items use `text-muted-foreground` -- handled by token fix

### 7. Product Card (`src/components/ProductCard.tsx`)
- Price and title text are already using `font-medium` / `font-semibold` -- no changes needed

---

## Summary of files to edit

| File | What changes |
|---|---|
| `src/index.css` | Darken `--muted-foreground` in both light and dark mode; bump heading weight to 600 |
| `src/pages/Index.tsx` | Replace `opacity-70` / `opacity-80` with `opacity-90` on newsletter and popup text |
| `src/components/layout/Footer.tsx` | Boost opacity on headings (`opacity-90`), links (`opacity-90`), copyright (`opacity-70`) |

Only 3 files need editing. The color token change in `index.css` automatically improves readability across the entire site (Header, Shop, About, Contact, Product Detail) without touching those files individually.
