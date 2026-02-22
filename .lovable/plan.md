

# Fix "Shop by Category" heading spacing to match "Featured"

## Problem
The "Shop by Category" heading row is wrapped inside a `max-w-6xl mx-auto px-4` container div, and then also has the responsive padding class `px-4 md:px-[max(2rem,calc((100vw-1280px)/2+2rem))]`. This double-wrapping causes the text to sit further inward compared to the "Featured" heading, which only uses the responsive padding directly.

## Fix

**File: `src/pages/Index.tsx` (line 220)**

Move the heading row **outside** the `max-w-6xl` container so it uses the same edge-to-edge responsive padding as the Featured section. Remove the extra `px-4 md:px-[...]` from the heading div since it will now sit at the same level as Featured's heading.

Specifically:
- Pull the heading `div` (lines 220-230) out of the `max-w-6xl` wrapper so it becomes a direct child of the `section`, just like the Featured heading is a direct child of its section.
- Keep the category grid inside the `max-w-6xl` container.

The result: both "Featured" and "Shop by Category" headings share the identical structure and spacing.
