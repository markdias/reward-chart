import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('children').select('id, name, pet_food, points');
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Children data:");
    console.dir(data, { depth: null });
  }
}

test();
