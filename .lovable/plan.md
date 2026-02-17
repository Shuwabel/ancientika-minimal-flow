

# Fix Search Input Auto-Focus

## Problem

The search input does not auto-focus when the search icon is clicked. The root cause is `AnimatePresence mode="wait"` in the header — this mode waits for the exiting element (normal header) to finish its animation before mounting the entering element (search bar with input). By the time `requestAnimationFrame` fires, the input element hasn't been rendered yet, so `.focus()` does nothing.

## Solution

Add `autoFocus` attribute directly to the search `<input>` element. This is the simplest and most reliable fix — the browser will automatically focus the input as soon as it mounts, regardless of animation timing.

## Technical Details

### File: `src/components/layout/Header.tsx`

1. Add `autoFocus` prop to the search `<input>` on line 81-87
2. The `requestAnimationFrame` call in `openSearch` can remain as a fallback, but `autoFocus` will handle the primary focus behavior

Single-line change:
```
<input
  ref={searchInputRef}
  type="text"
  autoFocus        // <-- add this
  value={searchQuery}
  ...
/>
```

