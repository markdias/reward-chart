import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qnbpenvudqrngbxelvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYnBlbnZ1ZHFybmdieGVsdm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjEzMTEsImV4cCI6MjA5Nzg5NzMxMX0.cyhwH_AlkBR-xZ82VbFgYtI9V4_VZp9D_fGO24f8OW4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('parent_profiles').update({ weekly_points_target: 999 }).eq('user_id', '00000000-0000-0000-0000-000000000000').select();
  console.log("DATA:", data, "ERROR:", error);
}

test();
