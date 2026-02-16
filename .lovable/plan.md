

# Plan: Google Auth + Email/SMS OTP (Remove Magic Link)

## Overview

Redesign the Auth page to support exactly three sign-in methods:
1. **Google OAuth** (keep as-is)
2. **Email OTP** -- 6-digit code sent to email, verified on-page
3. **SMS OTP** -- 6-digit code sent to phone, verified on-page

The magic link flow and "check your email" screen are removed entirely.

---

## SMS OTP Prerequisite

SMS OTP requires a phone provider (e.g. **Twilio**) configured in the backend. You will need:
- A Twilio account
- Three secrets: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`

We will store these as backend secrets and configure phone auth during implementation.

---

## Auth Page Redesign (`src/pages/Auth.tsx`)

### New UI Flow

```text
+---------------------------+
|   Continue with Google    |
+---------------------------+
         --- or ---
  [ Email ]  [ Phone ] tabs
+---------------------------+
| Email: your@email.com     |
| -- or --                  |
| Phone: +1234567890        |
|        [Send Code]        |
+---------------------------+
         |  (after send)
         v
+---------------------------+
| Enter 6-digit code        |
| [_][_][_][_][_][_]        |
|       [Verify]            |
| Resend code  |  Go back   |
+---------------------------+
```

### State

- `method`: `"email"` | `"phone"` -- active tab
- `step`: `"form"` | `"otp"` -- input vs verification
- `identifier`: the email or phone number entered

### Key Logic

| Action | API Call |
|--------|----------|
| Send email code | `supabase.auth.signInWithOtp({ email })` |
| Send SMS code | `supabase.auth.signInWithOtp({ phone })` |
| Verify email code | `supabase.auth.verifyOtp({ email, token, type: 'email' })` |
| Verify SMS code | `supabase.auth.verifyOtp({ phone, token, type: 'sms' })` |
| Google sign-in | `lovable.auth.signInWithOAuth("google", ...)` (unchanged) |

### UI Components Used

- `Tabs` / `TabsList` / `TabsTrigger` from existing tabs component for Email/Phone toggle
- `InputOTP` / `InputOTPGroup` / `InputOTPSlot` from existing input-otp component for 6-digit entry
- Phone input accepts international format with `+` prefix

### What Gets Removed

- The `"sent"` step (magic link confirmation screen with CheckCircle icon)
- The "Click the link in your email" messaging
- The "Resend link" button (replaced by "Resend code")

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Rewrite: replace magic link flow with Email/Phone tabs + OTP verification step |

## No Other Changes

- `useAuth.ts` -- unchanged
- `lovable/index.ts` -- unchanged (Google OAuth stays the same)
- Database -- unchanged (profile trigger already handles new signups)
- Account page -- unchanged

