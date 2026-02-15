
-- Remove permissive INSERT policies (inserts now go through edge functions with service role)
DROP POLICY "Anyone can submit a message" ON public.contact_messages;
DROP POLICY "Anyone can subscribe" ON public.newsletter_subscribers;
