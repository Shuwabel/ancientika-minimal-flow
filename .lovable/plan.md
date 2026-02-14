

## Fix Subtitle Sizing in Hero Section

### What is changing
The tagline "Your presence, refined." below the "ancientika" heading will be made visually smaller and lighter so it clearly sits beneath the brand name without competing with it.

### Change
In `src/pages/Index.tsx`, update the tagline paragraph styling:
- Remove `font-bold` to reduce visual weight
- Reduce size from `text-xl md:text-2xl` to `text-base md:text-lg`
- Keep the existing `tracking-wide` and `mb-8`

This ensures the "ancientika" brand name remains the dominant visual element in the hero section.

