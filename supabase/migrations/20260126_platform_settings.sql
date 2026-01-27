-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL, -- "general", "payment", "email", "course", "feature", "moderation", "advanced"
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_integrations table
CREATE TABLE IF NOT EXISTS payment_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- "stripe", "paypal", "square"
  api_key TEXT, -- Encrypted or masked in real app, effectively storing as text here for simplicity but marked potentially sensitive
  secret_key TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  test_mode BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,
  webhook_secret TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  subject TEXT,
  template_html TEXT,
  template_text TEXT,
  variables JSONB, -- List of available variables
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policies for platform_settings
CREATE POLICY "Admins can view all settings"
  ON platform_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update settings"
  ON platform_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert settings"
  ON platform_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policies for payment_integrations
CREATE POLICY "Admins can view payment integrations"
  ON payment_integrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage payment integrations"
  ON payment_integrations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policies for email_templates
CREATE POLICY "Admins can view email templates"
  ON email_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Insert default settings
INSERT INTO platform_settings (setting_key, setting_value, category, description, is_sensitive)
VALUES
  ('platform_name', '"HBM Academy"', 'general', 'Name of the platform', false),
  ('platform_url', '"https://hbm.example.com"', 'general', 'Main URL of the platform', false),
  ('support_email', '"support@hbm.example.com"', 'general', 'Support email address', false),
  ('payment_currency', '"USD"', 'payment', 'Default currency for payments', false),
  ('maintenance_mode', 'false', 'advanced', 'Is the platform in maintenance mode', false),
  ('default_course_level', '"beginner"', 'course', 'Default difficulty level for new courses', false),
  ('enable_course_ratings', 'true', 'course', 'Enable ratings for courses', false),
  ('enable_live_classes', 'false', 'feature', 'Enable live class functionality', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (template_key, subject, template_html, template_text, variables, is_active)
VALUES 
  ('welcome_email', 'Welcome to {platform_name}!', '<h1>Welcome, {user_name}!</h1><p>Thanks for joining.</p>', 'Welcome, {user_name}! Thanks for joining.', '["user_name", "platform_name"]', true),
  ('password_reset', 'Reset your password', '<h1>Reset Password</h1><p>Click here to reset: {link}</p>', 'Reset Password. Click here to reset: {link}', '["link"]', true)
ON CONFLICT (template_key) DO NOTHING;
