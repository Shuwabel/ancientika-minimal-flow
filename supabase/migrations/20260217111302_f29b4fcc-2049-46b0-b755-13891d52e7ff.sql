
-- Create email_otps table for custom OTP authentication
CREATE TABLE public.email_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast email lookups
CREATE INDEX idx_email_otps_email ON public.email_otps (email);

-- Index for cleanup of expired OTPs
CREATE INDEX idx_email_otps_expires_at ON public.email_otps (expires_at);

-- Enable RLS
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- No public access at all - only edge functions with service role key can access
CREATE POLICY "No public select" ON public.email_otps FOR SELECT USING (false);
CREATE POLICY "No public insert" ON public.email_otps FOR INSERT WITH CHECK (false);
CREATE POLICY "No public update" ON public.email_otps FOR UPDATE USING (false);
CREATE POLICY "No public delete" ON public.email_otps FOR DELETE USING (false);

-- Trigger for updated_at
CREATE TRIGGER update_email_otps_updated_at
  BEFORE UPDATE ON public.email_otps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
