

# Search Bar — Header Replacement Approach

## Concept

When the search icon is clicked, the entire header transforms into a brand-brown search bar. No overlay, no backdrop blur, no modal. The search bar occupies the exact same space as the header (sticky, same height, same z-index). When closed, the normal header returns.

## How It Works

```text
NORMAL STATE:
+--[Menu]---[ancientika]----------[Search][User][Cart]--+

SEARCH ACTIVE STATE:
+--[Search Icon]---[input field]----------------[X]-----+
     (brand brown background, white/light text)
```

- The brown bar uses the accent color (`hsl(25 30% 35%)`) as its background
- Input text and icons use `accent-foreground` (light/cream) for contrast
- Results dropdown appears below this bar, same as before but without any backdrop overlay

## Changes

### File: `src/components/layout/Header.tsx`

- When `searchOpen` is true, render the search bar instead of the normal header content
- The search bar sits inside the same `<header>` element (keeps sticky positioning, z-index, and height)
- Uses `bg-accent` for brand brown background
- Contains: search icon, text input (auto-focused), and X close button
- Smooth transition between normal header and search bar using AnimatePresence

### File: `src/components/PredictiveSearch.tsx`

- Remove the full-screen fixed overlay, backdrop blur, and top-pinned bar entirely
- Convert to a dropdown-only component that renders the results panel directly below the header
- Results panel: `position: fixed` or `absolute`, pinned to `top: 64px` (below header), centered with max-width
- Keep all existing search logic (debounce, Shopify fetch, suggestions from real data)
- Keep the two-column desktop / stacked mobile layout for results
- Add a subtle shadow on the results dropdown
- Clicking outside the results closes search (via a transparent click-catcher, no dark overlay)

### Visual Details

- Header search bar: `bg-accent text-accent-foreground` (mocha brown with cream text)
- Input placeholder: lighter opacity cream
- Results dropdown: `bg-background` with `shadow-xl`, no backdrop behind it
- Close (X) button: cream/light colored on the brown bar
- ESC key still closes search
- Auto-focus input when search activates

### Interaction Flow

1. User clicks search icon in header
2. Header content replaced by brown search bar with input
3. User types — results dropdown appears below header
4. Clicking a result navigates and closes search
5. Clicking X or pressing ESC returns to normal header
6. Clicking outside results panel closes search

