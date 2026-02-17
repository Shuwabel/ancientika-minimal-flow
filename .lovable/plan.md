

# Fix Duplicate Prevention and Sync Existing Customers

## What's happening now

- The Admin API token does NOT have `read_customers` scope, so the `shopifyAdminLookupCustomer` function always fails with 401
- One user (shuwabel@gmail.com) is stuck with `"shopify_exists_unlinked"` and won't be retried
- New users signing up will work fine (Storefront API `customerCreate` works)

## Changes

### 1. Fix the "already synced" check

Update `sync-shopify-customer` so users with `"shopify_exists_unlinked"` are retried instead of being skipped. Only skip users who have a real Shopify GID (starts with `gid://`).

```
Line 124: Change from
  if (profile?.shopify_customer_id)
to
  if (profile?.shopify_customer_id?.startsWith("gid://"))
```

### 2. Remove Admin API lookup (not usable)

Since the Admin token lacks `read_customers`, remove the `shopifyAdminLookupCustomer` function and related constants (`SHOPIFY_ADMIN_URL`, `CUSTOMER_LOOKUP_QUERY`). In the TAKEN error handler, just store `"shopify_exists_unlinked"` directly -- this is the only possible outcome without Admin API access.

### 3. Reset the stuck user and re-trigger sync

- Set `shopify_customer_id` to `NULL` for shuwabel@gmail.com so the sync retries
- Call the `sync-shopify-customer` function to attempt creating the customer again
- If shuwabel@gmail.com already exists in Shopify (TAKEN error), they'll be marked as `"shopify_exists_unlinked"` again -- this is expected and harmless since their Shopify account already exists

### 4. No batch sync function needed (yet)

There's only 1 user right now. The existing per-login sync handles all future users automatically. A batch function can be added later when there are more users to process.

## Technical Summary

**Files modified:**
- `supabase/functions/sync-shopify-customer/index.ts` -- remove Admin API code, fix skip logic

**Data change:**
- Reset `shopify_customer_id` to NULL for user `645eae45-85ca-4ec7-9ff9-3443b55a2574`

**Result:** Going forward, every new sign-up creates a Shopify customer via the Private Storefront Token. The one existing user will be re-synced on next login.

