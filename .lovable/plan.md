

# Fix: Address Sync Without Passwords

## The Problem

The Storefront API's `customerAccessTokenCreate` requires `email + password`. Your site is passwordless (OTP only), so:

- A random password is generated during customer creation but never stored
- Address can only be synced in that exact same request (right after creation)
- If the user adds address details later, there's no way to sync them

## Solution

Since we already generate the random password during `customerCreate`, we should **store it** securely so we can use it later for address syncs and future profile updates.

### Changes

#### 1. Add an encrypted column to profiles

Add a `shopify_customer_token` column to store the random password. This is only used server-side in the edge function -- never exposed to the client.

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS shopify_customer_token text;
```

The existing RLS policies already prevent users from reading other users' profiles, and the edge function uses the service role key, so this column is safe.

#### 2. Update `sync-shopify-customer` edge function

- After generating the `randomPassword` and successfully creating the customer, **save it** to `shopify_customer_token` alongside the Shopify GID
- When address data exists but wasn't synced during creation (e.g., user filled it in later), use the stored token to get a `customerAccessToken` and create the address

#### 3. Add a separate "sync profile updates" capability

Create logic so that when a user updates their profile (name, phone, address) on the Account page, the edge function can:
1. Read the stored `shopify_customer_token`
2. Call `customerAccessTokenCreate` with email + stored token
3. Use `customerUpdate` and `customerAddressCreate`/`customerAddressUpdate` mutations to push changes to Shopify

This means profile updates on the Account page can trigger a re-sync to Shopify with the latest data.

### Flow After Changes

1. User signs up -> `customerCreate` with random password -> password saved to `shopify_customer_token`
2. User fills in name/phone/address on Account page
3. On save, the edge function uses stored token to get access token
4. Pushes name, phone, address updates to Shopify

### Files Modified

- **Migration**: Add `shopify_customer_token` column to `profiles`
- **`supabase/functions/sync-shopify-customer/index.ts`**: Store the token on creation; add re-sync logic using stored token for subsequent updates
- **`src/pages/Account.tsx`**: Trigger Shopify re-sync when profile is saved (fire-and-forget call)

### Security Notes

- The `shopify_customer_token` is only used server-side (edge function with service role key)
- RLS ensures users can only see their own profile row, and the frontend query does not select this column
- The token is a random UUID-based string, not a user-chosen password

