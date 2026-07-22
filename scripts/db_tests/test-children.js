import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing URL or KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  console.log("Testing children select...");
  const { data: dbData, error: dbError } = await supabase.from('children').select('*').limit(1);
  if (dbError) {
    console.log("DB Select Error:", JSON.stringify(dbError, null, 2));
  } else {
    console.log("DB Select Success!");
  }
}

test();
