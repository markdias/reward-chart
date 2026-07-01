import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qnbpenvudqrngbxelvnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYnBlbnZ1ZHFybmdieGVsdm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjEzMTEsImV4cCI6MjA5Nzg5NzMxMX0.cyhwH_AlkBR-xZ82VbFgYtI9V4_VZp9D_fGO24f8OW4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('parent_profiles').select('*').limit(1);
  console.log(data, error);
}

check();
