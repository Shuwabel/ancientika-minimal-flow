

## Fix Currency Display in Cart Drawer

The cart drawer currently has two currency issues:

1. **Line item prices** (line 78) use a hardcoded `$` symbol
2. **Total price** (line 89) only maps `USD` to `$`, leaving other currencies like `NGN` showing as raw code (e.g., `NGN45000.00`)

### Solution

Add a small currency formatting helper that maps currency codes to their symbols (e.g., `NGN` to `₦`, `USD` to `$`, `GBP` to `£`, etc.) and use it in both places.

### Technical Details

**File: `src/components/layout/CartDrawer.tsx`**

- Add a `getCurrencySymbol` helper function that maps common currency codes to symbols, defaulting to the code itself for unknown currencies
- **Line 78**: Replace hardcoded `$` with `getCurrencySymbol(item.price.currencyCode)`
- **Line 89**: Replace the ternary with `getCurrencySymbol(currency)`

This ensures all prices display correctly as `₦45,000.00` instead of `$45000.00`.

