
-- Add CHECK constraints for server-side input validation on contact_messages
ALTER TABLE public.contact_messages
  ADD CONSTRAINT check_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT check_email_length CHECK (char_length(email) BETWEEN 1 AND 255),
  ADD CONSTRAINT check_email_format CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  ADD CONSTRAINT check_message_length CHECK (char_length(message) BETWEEN 1 AND 2000);

-- Add CHECK constraints for newsletter_subscribers
ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT check_sub_email_length CHECK (char_length(email) BETWEEN 1 AND 255),
  ADD CONSTRAINT check_sub_email_format CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$');
