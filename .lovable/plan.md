

# Shop Page: Filter & Grid Enhancements

## 4 Changes

### 1. Filters start closed by default
Change the initial state of all three collapsible filter sections from `true` to `false`:
- `availabilityOpen` -> `false`
- `priceOpen` -> `false`
- `sizeOpen` -> `false`

### 2. Availability filter shows counts
Compute `inStockCount` and `outOfStockCount` from the category-filtered products (before other filters are applied), then display them next to each label:
- "In stock (30)"
- "Out of stock (5)"

### 3. Grid view selector (Large, Small, List)
Add a grid view toggle to the **right side** of the header row, **after** the Sort dropdown:

```text
| 91 products                    Sort v  [Large] [Small] [List] |
```

- **Large**: 2 columns on all screens (bigger product images)
- **Small**: 2 columns mobile, 3 columns desktop (current default)
- **List**: Single-column horizontal rows (image left, details right)

Uses icon buttons (`LayoutGrid`, `Grid3x3`, `List` from lucide-react) placed to the right of the Sort dropdown, not in between the product count and sort.

### 4. Sidebar stays sticky
The sidebar already has `sticky top-24 self-start` -- no changes needed.

## Technical Details

### File: `src/pages/Shop.tsx`

**State changes**:
- Set `availabilityOpen`, `priceOpen`, `sizeOpen` to `false`
- Add `gridView` state: `"small" | "large" | "list"` defaulting to `"small"`

**New computed values**:
- `inStockCount` / `outOfStockCount`: count products in current category by `availableForSale`

**Availability labels**:
- Change "In stock" to `In stock (${inStockCount})`
- Change "Out of stock" to `Out of stock (${outOfStockCount})`

**Grid header layout** (the `flex items-center justify-between` row):
- Left: product count
- Right: Sort dropdown **then** three grid view icon buttons (in that order, left to right)

**Product grid**:
- Dynamic class based on `gridView`:
  - `"large"`: `grid-cols-1 md:grid-cols-2`
  - `"small"`: `grid-cols-2 md:grid-cols-3`
  - `"list"`: `grid-cols-1` with each item rendered as a horizontal card (image left, info right)

