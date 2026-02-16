

# Fix: Enable 6-Digit Email OTP (No Template Editor Needed)

## Problem

The Lovable Cloud Auth Settings UI does not include an email template editor, so the previous instructions were incorrect. We need an alternative approach to switch from magic links to 6-digit OTP codes.

## Solution

There are two parts to this fix:

### 1. Backend: Update Email OTP Configuration

The email OTP type needs to be changed from "magiclink" to "otp" in the backend auth configuration. This will be done using the backend auth configuration tool (not a manual UI step). Once configured, `supabase.auth.signInWithOtp({ email })` will automatically send a 6-digit code instead of a magic link.

### 2. No Frontend Changes Needed

The current `Auth.tsx` already has the correct verification logic using `supabase.auth.verifyOtp({ email, token, type: 'email' })`, so no code changes are required.

## Steps

1. Use the Lovable Cloud auth configuration tool to set the email OTP type to code-based (not magic link)
2. Test the flow to confirm a 6-digit code arrives instead of a clickable link

## Files Changed

None -- this is a backend configuration change only.

