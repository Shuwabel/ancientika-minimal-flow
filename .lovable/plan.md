

# Plan: Fix Address Sync + Separate Sign Up / Sign In Flows

## Overview

Two changes: (1) fix the address sync issue with Shopify, and (2) split the Auth page into distinct **Sign Up** and **Sign In** flows, where Sign Up collects all profile data upfront.

---

## Part 1: Fix Address Sync

The Shopify error was `Province is invalid` because the `state` field contained placeholder text (`"Select state..."`) and the `country` field sent the full name (`"Nigeria"`) instead of the ISO code (`"NG"`) that Shopify expects.

### Changes to `supabase/functions/sync-shopify-customer/index.ts`

- Update `buildAddressInput` to:
  - Map full country names to 2-letter ISO codes (e.g., "Nigeria" -> "NG") using a lookup table built from the country codes list
  - Skip the `province` field if the value is empty, null, or contains placeholder text like "Select"
  - This ensures Shopify never receives invalid data

---

## Part 2: Separate Sign Up and Sign In

### Current Flow
One page handles both sign-up and sign-in identically -- just enter email/phone, get OTP, done.

### New Flow

**Sign In tab** (returning users):
- Same as today -- enter email/phone, verify OTP, go to account/home
- No profile form shown

**Sign Up tab** (new users):
- Step 1: Enter email/phone, get OTP, verify it
- Step 2: Profile completion form appears with:
  - First Name, Last Name (required)
  - Phone Number with country code selector
  - Address: line 1, line 2, city, state, postal code, country (dropdown from existing country codes list)
  - Checkbox: "Help me find my perfect size"
    - If checked, expands to show: Gender, Height + unit, Weight + unit, Body Shape, Fit Preference
  - Fit Preference options: **Slim Fit** and **Baggy** (2 options only)
- Step 3: On submit -- save everything to `profiles` table, trigger Shopify sync, navigate to home

### Detection Logic
- The Sign Up vs Sign In distinction is handled by **tabs at the top of the page** -- the user explicitly chooses which flow they want
- Sign Up always shows the profile form after OTP verification
- Sign In never shows it

---

## Technical Details

### Files Modified

1. **`supabase/functions/sync-shopify-customer/index.ts`**
   - Add country name-to-ISO-code mapping in `buildAddressInput`
   - Skip `province` when value is empty or contains placeholder text
   - Keeps all existing creation/update logic intact

2. **`src/pages/Auth.tsx`** (major rewrite)
   - Add top-level tabs: "Sign In" / "Sign Up"
   - **Sign In flow**: Current behavior unchanged (email/phone OTP -> verify -> navigate)
   - **Sign Up flow**: email/phone OTP -> verify -> profile completion form -> save + sync -> navigate
   - Profile form includes:
     - Name fields (first, last)
     - Phone with `CountryCodeSelect` component (already exists)
     - Full address fields with country as a searchable dropdown using `src/lib/country-codes.ts`
     - State as free-text input (supports all countries)
     - Optional "Help me find my size" checkbox that reveals measurement fields
     - Fit preference: "Slim Fit" / "Baggy"
   - On profile submit: save all fields to `profiles` table via Supabase, then call `sync-shopify-customer` with `syncProfile: true`

3. **`src/pages/Account.tsx`**
   - Update fit preference options from "Tight / Regular / Loose" to "Slim Fit / Baggy"

### No Database Changes Required

The existing `profiles` table already has all the necessary columns.

