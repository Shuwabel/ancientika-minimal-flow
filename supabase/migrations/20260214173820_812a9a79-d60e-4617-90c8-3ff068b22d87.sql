
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to subscribe
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE from frontend
CREATE POLICY "No public read access"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (false);
