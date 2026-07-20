import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  console.log("Checking if reward_redemptions exists...");
  const { data, error } = await supabase.from('reward_redemptions').select('*').limit(1);
  if (error) {
    console.log("DB Query Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("DB Query Success, Table exists!");
  }
}

test();
