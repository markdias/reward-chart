import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data: policies, error } = await supabase.rpc('get_policies_for_table', { table_name: 'children' });
  console.log("Policies:", policies, error);
}

test();
