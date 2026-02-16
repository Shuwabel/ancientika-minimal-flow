

# Typography Update: Switch to Inter for All General Text

## Overview

Replace PorshaRichela as the global body/heading font with **Inter**, reserving PorshaRichela exclusively for brand name instances (e.g. "ancientika" text in the header logo and footer).

## Changes

### 1. `src/index.css`
- Import Inter from Google Fonts (replace or keep alongside the existing DM Sans import).
- Change the `body` rule from `font-family: 'PorshaRichela'` to `font-family: 'Inter', sans-serif`.
- Change `h1-h6` rule to use `'Inter', sans-serif`.
- Keep the `.font-display` utility class pointing to PorshaRichela for brand-name usage.

### 2. `tailwind.config.ts`
- Update `fontFamily.sans` to `["Inter", "sans-serif"]`.
- Keep `fontFamily.display` as `["PorshaRichela", "cursive"]` for brand text.

### 3. Components using brand name text
- `src/components/layout/Header.tsx` -- the "ancientika" `<span>` already has `style={{ fontFamily: 'PorshaRichela' }}`, so it will continue using the brand font. No change needed.
- `src/components/layout/Footer.tsx` -- the logo image is used, no text change needed.

### Summary of impact
- All body copy, headings, buttons, navigation, and form elements will render in Inter.
- Only explicit `.font-display` or inline `fontFamily: 'PorshaRichela'` usage will show the brand font.
- No structural or layout changes required.
