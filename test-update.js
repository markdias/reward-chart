import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('parent_profiles').update({ weekly_points_target: 999 }).eq('user_id', '00000000-0000-0000-0000-000000000000').select();
  console.log("DATA:", data, "ERROR:", error);
}

test();
