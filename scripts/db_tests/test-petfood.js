import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('children').select('pet_food').limit(1);
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Data:", data);
  }
}

test();
