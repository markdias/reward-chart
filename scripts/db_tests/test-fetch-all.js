import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data: c } = await supabase.from('children').select('*');
  const { data: t } = await supabase.from('tasks').select('*');
  console.log("Children in DB:", c ? c.length : 'error');
  console.log("Tasks in DB:", t ? t.length : 'error');
  
  if (c && c.length > 0) {
    console.log("Latest child:", c[c.length - 1]);
  }
}

test();
