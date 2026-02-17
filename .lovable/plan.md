

# Plan: Default to Nigeria (+234) for Country Code and Country Dropdown

## Changes

### 1. Sign Up Form (`src/components/ProfileSetupForm.tsx`)
- Change `phoneDial` default from `"+1"` to `"+234"` (Nigeria)
- Change `country` default from `""` to `"Nigeria"`

### 2. Account Page (`src/pages/Account.tsx`)
- Change `phoneDial` fallback default from `"+1"` to `"+234"` (used when no phone is saved or no dial code match is found)
- Ensure the country dropdown defaults to "Nigeria" when no country is saved

### 3. Country Codes List (`src/lib/country-codes.ts`)
- Move Nigeria to the **top** of the `countryCodes` array so it appears first in all dropdowns (country code selector and country picker)
- All other countries remain alphabetically sorted after Nigeria

### Technical Details

These are small default-value changes across 3 files -- no logic or layout changes needed.

