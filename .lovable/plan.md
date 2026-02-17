

# Sync Customer Details to Shopify

## Problem

When creating a Shopify customer, only `email` and `password` are sent. Phone, name, and address from the user's profile are not included.

## What the Storefront API supports

The `CustomerCreateInput` accepts these fields:
- `email` (already sent)
- `password` (already sent)
- `firstName`
- `lastName`
- `phone`
- `acceptsMarketing`

Addresses cannot be set during `customerCreate` -- they require a separate mutation (`customerAddressCreate`) with a customer access token after creation.

## What's available in profiles table now

- `phone` -- available, can be sent
- `firstName` / `lastName` -- **not in profiles table yet** (need to add columns)
- Address fields (`address_line1`, `city`, `state`, `postal_code`, `country`) -- available, but require post-creation flow

## Changes

### 1. Add `first_name` and `last_name` columns to profiles table

New migration to add these columns so users can store their name.

### 2. Update Account page to include name fields

Add First Name and Last Name inputs to the Contact section of the Account page.

### 3. Update `sync-shopify-customer` edge function

- Fetch the full profile (not just `shopify_customer_id`) to get phone, first_name, last_name
- Pass `firstName`, `lastName`, `phone` to the `customerCreate` mutation input
- After successful creation, use `customerAccessTokenCreate` to get an access token, then call `customerAddressCreate` to save the address if available

### 4. Update `useAuth.ts` to pass profile data

Instead of only sending `userId` and `email`, also send the profile data to the sync function so it has everything it needs.

## Technical Details

### Migration SQL
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text;
```

### Edge function changes (`sync-shopify-customer/index.ts`)

- Fetch full profile: `select("shopify_customer_id, phone, first_name, last_name, address_line1, address_line2, city, state, postal_code, country")`
- Include in `customerCreate` input:
  ```
  firstName: profile.first_name || undefined
  lastName: profile.last_name || undefined
  phone: profile.phone || undefined
  ```
- Add `customerAccessTokenCreate` mutation to get access token after creation
- Add `customerAddressCreate` mutation to save address using the access token
- Add new GraphQL mutations for address creation

### Account page changes (`src/pages/Account.tsx`)

- Add `first_name` and `last_name` to the Profile interface
- Add two input fields in the Contact section
- Include them in the save handler

### Flow after changes

1. User signs up and fills in profile (name, phone, address)
2. On login, `ensureShopifySync` fires
3. Edge function fetches full profile
4. Creates Shopify customer with name + phone
5. Gets customer access token
6. Creates customer address in Shopify
7. Stores Shopify GID in profiles

