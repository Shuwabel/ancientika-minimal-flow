

# Integrate Brand Logos and Font

## What we're doing
Adding your uploaded Ancientika brand assets (logos and PorshaRichela font) into the project and using them throughout the site.

## Assets received
- **PorshaRichela.ttf** - Display/logo font
- **ancientika_logo_and_name_horizontal_2.png** - Black horizontal logo with text (for Header)
- **Ancientika_logo_mocha_brown.png** - Mocha brown icon-only logo
- **ANCIENTIKA_MAIN_LOGO.png** - Black icon-only logo
- **ANCIENTIKA_MAIN_LOGO_WHITE.png** - White icon-only logo (for dark backgrounds)
- **ika_white_vertical_logo.png** - White vertical logo with text
- **ikan_horizontal_logo.png** - White horizontal logo with text

## Where each asset will be used

| Asset | Location |
|-------|----------|
| PorshaRichela.ttf | Copied to `public/fonts/` - already referenced in CSS `@font-face` |
| Horizontal logo (black) | Header - replaces the text-only "Ancientika" link |
| White vertical logo | Footer - replaces the text-only "Ancientika" branding |
| White icon logo | Favicon / loading states (future use) |
| Mocha brown icon | About page accent or brand section |
| Black icon logo | Hero section on the home page |

## Changes

1. **Copy font file** to `public/fonts/PorshaRichela.ttf` so the existing `@font-face` rule works
2. **Copy all logo images** to `src/assets/` for use as ES6 imports
3. **Header** - Replace the `font-display` text with the horizontal black logo image (`~h-8`)
4. **Footer** - Replace the text "Ancientika" with the white vertical logo image
5. **Home page hero** - Add the black icon logo above the tagline for visual impact
6. **About page** - Use the mocha brown icon logo as a decorative accent

## Technical details
- Font goes to `public/fonts/` since it's already referenced via CSS `url('/fonts/PorshaRichela.ttf')`
- Logo images go to `src/assets/` and are imported as ES6 modules for proper bundling
- All `<img>` tags will include proper `alt` text for accessibility
- The `font-display` class already exists in CSS and will now render correctly once the `.ttf` file is in place

