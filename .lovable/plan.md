

# Plan: Fix Account Page for Unauthenticated Users

## Problem

When a user is not logged in and clicks the profile button, the Account page shows a blank/loading state instead of immediately redirecting to `/auth`. This happens because:

1. The redirect effect (`navigate("/auth")`) and the profile-loading effect run independently
2. When there's no user, the profile fetch exits early without setting `loading` to `false`, so the page shows an infinite spinner
3. There's a brief race between the redirect and the render

## Solution

Two small changes in `src/pages/Account.tsx`:

### 1. Add early return before the loading spinner

Before the loading/spinner check, add a guard that returns nothing if the user isn't authenticated (the redirect effect handles navigation):

```typescript
if (!authLoading && !user) return null;
```

This ensures the page never renders content for unauthenticated users.

### 2. Fix the loading state when there's no user

In the profile-fetching `useEffect`, set `setLoading(false)` in the early return when `!user`:

```typescript
if (!user) {
  setLoading(false);
  return;
}
```

This prevents the infinite spinner for logged-out users and lets the redirect happen cleanly.

## Files Modified

- **`src/pages/Account.tsx`** -- two small guard fixes (no layout or logic changes)

