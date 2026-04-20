-- Fix foreign key mapping for admin_notification_settings
-- The NextAuth flow uses public.users instead of auth.users

ALTER TABLE public.admin_notification_settings 
  DROP CONSTRAINT IF EXISTS admin_notification_settings_admin_user_id_fkey;

ALTER TABLE public.admin_notification_settings 
  ADD CONSTRAINT admin_notification_settings_admin_user_id_fkey 
  FOREIGN KEY (admin_user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;
