

# Fix Typography Readability + Replace Hero Brand Text with Logo

## Problem
From the screenshots, text across the site is nearly invisible against the glassmorphism surfaces. The `muted-foreground` token and opacity values are still too weak. Additionally, the hero section needs the "ancientika" text replaced with the horizontal logo+name image.

## Changes

### 1. Stronger foreground colors (`src/index.css`)

**Light mode:**
- `--foreground`: darken from `30 10% 10%` to `30 10% 5%` (near black)
- `--muted-foreground`: darken from `30 8% 30%` to `30 10% 20%` (much darker, clearly readable)

**Dark mode:**
- `--muted-foreground`: brighten from `30 10% 70%` to `30 12% 80%` (brighter white)

**Body text:**
- Increase base font size by adding `font-size: 15px` (slightly larger than browser default 16px won't help much -- instead we'll target specific elements)

**Sidebar / navigation text:**
- Bump from `text-sm` (14px) to `text-base` (16px) for nav items in the mobile sidebar

### 2. Replace hero "ancientika" text with logo image (`src/pages/Index.tsx`)
- Remove the `<h1 className="font-display ...">ancientika</h1>` line
- Replace the small icon logo (`mainLogo`) with the horizontal logo+name image (`ancientika_logo_and_name_horizontal_2.png`), sized larger (e.g., `h-28 md:h-40`)

### 3. Boost text contrast in Header sidebar (`src/components/layout/Header.tsx`)
- Change sidebar nav items from `text-muted-foreground` to `text-foreground` so they're clearly visible against the glass background
- Increase sidebar nav text from `text-sm` to `text-base` for better readability
- Same for desktop dropdown items

### 4. Boost text contrast in Footer (`src/components/layout/Footer.tsx`)
- Change footer heading and link opacity from `opacity-90` to `opacity-100` (full white on dark glass)
- Change copyright opacity from `opacity-70` to `opacity-80`
- Increase footer link text from `text-xs` to `text-sm` for readability

### 5. Boost text on Index page sections (`src/pages/Index.tsx`)
- Newsletter banner: ensure text is fully opaque
- Newsletter section: boost text opacity to 1.0
- Philosophy section: change body text from `text-muted-foreground` to `text-foreground` with slightly reduced opacity (`opacity-80`)

---

## Summary of files to edit

| File | What changes |
|---|---|
| `src/index.css` | Darken `--foreground` and `--muted-foreground` further in both modes |
| `src/pages/Index.tsx` | Replace hero h1 text with horizontal logo image; boost text opacity across sections |
| `src/components/layout/Header.tsx` | Use `text-foreground` instead of `text-muted-foreground` for nav items; increase font size |
| `src/components/layout/Footer.tsx` | Full opacity on text; increase link font size to `text-sm` |
