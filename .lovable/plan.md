
# Plan: Remove All Authentication and User Management

## Summary

Strip out every authentication, user profile, and account management feature from the frontend. The **only user-facing feature that remains** is the AI "Find My Size" recommender, which already persists its data in the browser's local storage (no account needed).

## What Gets Removed

### Pages
- **`src/pages/Auth.tsx`** -- the entire sign-up / sign-in page (delete file)
- **`src/pages/Account.tsx`** -- the entire profile/account page (delete file)

### Components
- **`src/components/layout/UserMenu.tsx`** -- the user/profile icon in the header (delete file)
- **`src/components/ProfileSetupForm.tsx`** -- the multi-step onboarding form (delete file)
- **`src/components/CountryCodeSelect.tsx`** -- only used by auth/profile forms (delete file)

### Hooks
- **`src/hooks/useAuth.ts`** -- the authentication hook (delete file)

### Data
- **`src/lib/country-codes.ts`** -- only used by the auth/profile forms (delete file)

### Header Update
- **`src/components/layout/Header.tsx`** -- remove the `UserMenu` import and its usage from the icon row (line 163). The header keeps Search and Cart icons only.

### Router Update
- **`src/App.tsx`** -- remove the `/auth` and `/account` routes, and remove their imports

## What Stays

- **Size Recommender** (`SizeRecommenderModal`, `SizeGuideModal`, `sizeStore`, `size-data`) -- fully intact, unchanged
- Size data is already persisted in `localStorage` via Zustand's `persist` middleware, so returning customers will see their saved size recommendations without needing an account
- **Size Guide page** (`/size-guide`) -- stays as-is
- All shopping features (cart, products, collections, Shopify integration)
- Contact page, About page, Product Care page

## Edge Functions (no changes needed)

The backend edge functions (`request-otp`, `verify-otp`, `sync-shopify-customer`, etc.) and database tables (`profiles`, `email_otps`) will remain deployed but simply won't be called from the frontend anymore. They can be cleaned up separately later if desired.

## Technical Details

### Files Deleted (7 files)
1. `src/pages/Auth.tsx`
2. `src/pages/Account.tsx`
3. `src/components/layout/UserMenu.tsx`
4. `src/components/ProfileSetupForm.tsx`
5. `src/components/CountryCodeSelect.tsx`
6. `src/hooks/useAuth.ts`
7. `src/lib/country-codes.ts`

### Files Modified (2 files)

1. **`src/App.tsx`**
   - Remove imports: `Auth`, `Account`
   - Remove routes: `/auth`, `/account`

2. **`src/components/layout/Header.tsx`**
   - Remove `import UserMenu` (line 3)
   - Remove `<UserMenu />` from the icons section (line 163)
