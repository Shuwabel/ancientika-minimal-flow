

# Lock Page Scroll + Tap-Outside-to-Close for Search

## What Changes

Two behaviors when the search is open:

1. **Page scroll is locked** -- the page behind the search results cannot scroll while search is active
2. **Tapping anywhere outside** the search bar and results panel closes the search

## Implementation

### File: `src/components/layout/Header.tsx`

- Add a `useEffect` that sets `document.body.style.overflow = "hidden"` when `searchOpen` is true, and restores it to `""` on close/unmount
- Add a `ref` to the `<header>` element and pass it to `PredictiveSearch` so click-outside logic can exclude both the header bar and results panel

### File: `src/components/PredictiveSearch.tsx`

- Accept a new `headerRef` prop (`React.RefObject<HTMLElement>`)
- Update the click-outside handler: close search only if the click target is outside BOTH `panelRef` (results dropdown) AND `headerRef` (the brown search bar)
- This prevents the search bar itself from accidentally triggering a close when clicked

### Technical Summary

```text
Header.tsx:
  - headerRef = useRef() -> attached to <header>
  - useEffect: searchOpen ? body.overflow = "hidden" : body.overflow = ""
  - Pass headerRef to <PredictiveSearch headerRef={headerRef} />

PredictiveSearch.tsx:
  - New prop: headerRef: React.RefObject<HTMLElement>
  - Click-outside check:
    if (!panelRef.contains(target) && !headerRef.current?.contains(target)) -> onClose()
```

