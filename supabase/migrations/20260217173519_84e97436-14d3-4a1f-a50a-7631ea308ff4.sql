ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS shopify_customer_token text;