-- Migration to support email OTP verification flows

CREATE TABLE IF NOT EXISTS public.email_otp_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('primary_change','notification_add')),
  otp_hash text NOT NULL,
  attempts integer DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_otp_tokens_user_id_purpose_idx ON public.email_otp_tokens (user_id, purpose);

-- Add RLS policies if necessary (assuming backend API accesses with service_role, RLS can be disabled or restricted)
ALTER TABLE public.email_otp_tokens ENABLE ROW LEVEL SECURITY;

-- Allow only service_role to manage OTP tokens
CREATE POLICY "Service role can manage email otp tokens" 
ON public.email_otp_tokens 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
