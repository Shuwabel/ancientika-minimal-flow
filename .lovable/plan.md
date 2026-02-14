

# UI Fixes Plan

## 1. Move Background Image to Hero Section (`src/pages/Index.tsx`)
The `collections-bg.jpg` background image is currently on the Collections grid section (line 92-94). It needs to move to the Hero + Featured section (line 44) which contains the "Explore Collection" button.

- Add the background image to the Hero section (line 44) behind the logo, caption, and Explore Collection button
- Remove the background image from the Collections grid section, reverting it to a plain section

## 2. Footer Logo and Text Update (`src/components/layout/Footer.tsx`)
- Replace the white vertical logo import with the mocha brown logo: `import mainLogo from "@/assets/Ancientika_logo_mocha_brown.png"`
- Remove the `brightness-0 invert` CSS filters since the brown logo doesn't need color inversion
- Replace the paragraph text `"Premium, defined by less. Scandinavian minimalism meets Japanese craftsmanship."` with just `"Premium, defined by less"` wrapped in a `<strong>` tag with bold styling

## 3. Make Newsletter Banner Clickable (`src/pages/Index.tsx`)
- Wrap the sticky marquee banner content (lines 32-41) in an `<a href="/#newsletter">` tag
- Add `id="newsletter"` to the Newsletter section (line 149)
- The native anchor tag handles hash-based scrolling automatically, including cross-page navigation

## Technical Details

### `src/pages/Index.tsx`
- Line 44: Add `collectionsBg` as background image to the Hero section
- Line 92-94: Remove the `<img>` and overlay from the Collections section
- Lines 32-40: Wrap marquee spans in `<a href="/#newsletter">`
- Line 149: Add `id="newsletter"` to the newsletter `<section>`

### `src/components/layout/Footer.tsx`
- Line 2: Change import to `Ancientika_logo_mocha_brown.png`
- Line 11: Remove `brightness-0 invert` classes
- Lines 12-14: Replace paragraph with `<p className="text-lg font-bold max-w-xs">Premium, defined by less</p>`
