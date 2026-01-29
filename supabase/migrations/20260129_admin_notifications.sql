-- Create admin_notification_settings table
create table if not exists public.admin_notification_settings (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete cascade not null unique,
  recipient_emails text[] default array[]::text[],
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.admin_notification_settings enable row level security;

-- Policies

-- Policy: Admin can view their own settings
create policy "Admins can view own notification settings"
  on public.admin_notification_settings
  for select
  using (auth.uid() = admin_user_id);

-- Policy: Admin can insert their own settings
create policy "Admins can insert own notification settings"
  on public.admin_notification_settings
  for insert
  with check (auth.uid() = admin_user_id);

-- Policy: Admin can update their own settings
create policy "Admins can update own notification settings"
  on public.admin_notification_settings
  for update
  using (auth.uid() = admin_user_id)
  with check (auth.uid() = admin_user_id);

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
drop trigger if exists on_admin_notification_settings_updated on public.admin_notification_settings;
create trigger on_admin_notification_settings_updated
  before update on public.admin_notification_settings
  for each row execute procedure public.handle_updated_at();

-- Grant permissions (adjust based on your roles, e.g. service_role, authenticated)
grant select, insert, update on public.admin_notification_settings to authenticated;
grant select, insert, update on public.admin_notification_settings to service_role;
