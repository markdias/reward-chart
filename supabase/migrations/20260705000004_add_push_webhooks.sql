-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_task_completion_notify ON public.completions;
DROP TRIGGER IF EXISTS on_reward_redemption_notify ON public.reward_redemptions;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.notify_parent_webhook();

-- Create the webhook function
CREATE OR REPLACE FUNCTION public.notify_parent_webhook()
RETURNS trigger AS $$
DECLARE
  edge_function_url TEXT := 'https://qnbpenvudqrngbxelvnx.supabase.co/functions/v1/notify-parent';
  request_body JSON;
BEGIN
  -- Construct the payload
  request_body := json_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', row_to_json(NEW),
    'schema', TG_TABLE_SCHEMA
  );

  -- Perform the HTTP POST request (Requires pg_net extension, which is usually enabled by default on Supabase)
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYnBlbnZ1ZHFybmdieGVsdm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjEzMTEsImV4cCI6MjA5Nzg5NzMxMX0.cyhwH_AlkBR-xZ82VbFgYtI9V4_VZp9D_fGO24f8OW4'
    ),
    body := request_body::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_task_completion_notify
  AFTER INSERT ON public.completions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_parent_webhook();

CREATE TRIGGER on_reward_redemption_notify
  AFTER INSERT ON public.reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_parent_webhook();
