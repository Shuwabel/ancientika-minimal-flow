

# Plan: Clean Slate Test for Shopify Customer Sync

## What We'll Do

1. **Reset your profile's Shopify fields in the database** -- set `shopify_customer_id` and `shopify_customer_token` back to `null` so the sync function treats you as a new customer

2. **You delete the customer from Shopify Admin** -- go to your Shopify Admin dashboard, find the customer with email shuwabel@gmail.com, and delete them

3. **Test the flow end-to-end**:
   - Log out and log back in (triggers `ensureShopifySync`)
   - The sync function should create a brand new Shopify customer with the random password
   - Both the Shopify GID and the random password get stored in the `profiles` table
   - Go to Account page, fill in name/phone/address, save
   - The save triggers a re-sync with `syncProfile: true`
   - The function uses the stored password to get a customer access token and pushes updates to Shopify

## Technical Details

### Step 1: Database Reset (single SQL update)

```sql
UPDATE profiles
SET shopify_customer_id = NULL, shopify_customer_token = NULL
WHERE user_id = '645eae45-85ca-4ec7-9ff9-3443b55a2574';
```

### Step 2: Manual Action (you)

Delete the customer "shuwabel@gmail.com" from your Shopify Admin at Settings > Customers.

### Step 3: No Code Changes Needed

The existing `sync-shopify-customer` edge function already handles:
- Creating new customers with a random password
- Storing the GID and password in `profiles`
- Using the stored password for subsequent profile/address updates

We just need to verify it works with a clean start.

### Files Modified

- **None** -- only a database data update to reset the two Shopify columns

