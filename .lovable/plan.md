

# Plan: Align Account Page with Sign Up + Simplify Auth Flow

## Changes

### 1. Auth Page (`src/pages/Auth.tsx`) - Remove Tabs, Default to Sign Up

- Remove the `TabsList` with "Sign In" / "Sign Up" tabs at the top
- Default view is **Sign Up** with heading "Create Account"
- Below the form, show: "Already have an account? **Sign in**" as a text link
- Clicking "Sign in" switches to the Sign In flow (heading "Welcome Back"), which shows "Don't have an account? **Sign up**" below
- **Sign In flow**: After OTP verification, navigate to **`/`** (homepage) instead of `/account`

### 2. Account Page (`src/pages/Account.tsx`) - Add Country Code Selector + Country Dropdown

Currently the Account page uses plain text inputs for Phone and Country. These need to match the Sign Up form:

- **Phone field**: Replace the plain `<Input>` with a `CountryCodeSelect` + phone number input (same layout as the Sign Up form). On load, parse the existing phone string (e.g., `+2348166084708`) to extract the dial code and number separately. On save, combine them back into a single string.

- **Country field**: Replace the plain `<Input>` with the same searchable country dropdown used in `ProfileSetupForm.tsx` (flag + country name, with search). This ensures the country value is always a valid name from the list, which the Shopify sync can then map to an ISO code.

### Technical Details

#### Files Modified

1. **`src/pages/Auth.tsx`**
   - Remove `Tabs`/`TabsList`/`TabsTrigger` for sign-in/sign-up toggle
   - Replace with `authMode` state defaulting to `"signup"`
   - Render inline text links to toggle between modes
   - Change sign-in post-verify navigation from `/account` to `/`

2. **`src/pages/Account.tsx`**
   - Import `CountryCodeSelect` and `countryCodes`
   - Add state for `phoneDial` and `phoneNumber` (parsed from `profile.phone` on load)
   - Replace phone `<Input>` with `CountryCodeSelect` + `<Input>` combo
   - Add state for `countryDropdownOpen` and `countrySearch`
   - Replace country `<Input>` with the same searchable dropdown pattern from `ProfileSetupForm.tsx`
   - On save, recombine phone as `${phoneDial}${phoneNumber}` before sending to the database

#### Phone Parsing Logic

When loading profile data, extract the dial code from the stored phone string:
- Match against known country dial codes from `countryCodes` list (longest match first)
- Set `phoneDial` to the matched code, `phoneNumber` to the remainder
- Fallback: default dial to `+1`, full string as number

