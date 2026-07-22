-- SQL Migration: Automatic Welcome Email & Resend Setup

-- 1. Create a function to send welcome email when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_email TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  user_email := NEW.email;
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'Parent');
  
  -- Retrieve Supabase project settings
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- Perform an asynchronous HTTP POST request to the send-email Edge Function if pg_net extension is enabled
  IF user_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := COALESCE(supabase_url, 'https://qnbpenvudqrngbxelvnx.supabase.co') || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(service_role_key, '')
      ),
      body := jsonb_build_object(
        'type', 'welcome',
        'to', user_email,
        'name', user_name
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log warning without blocking user creation
  RAISE WARNING 'Failed to trigger welcome email: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach trigger to auth.users AFTER INSERT
DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome ON auth.users;
CREATE TRIGGER on_auth_user_created_send_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_welcome_email();
