import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data: childData } = await supabase.from('children').select('*').limit(1);
  if (childData && childData.length > 0) {
    const child = childData[0];
    console.log("Updating child:", child.id);
    const { data, error } = await supabase.from('children').update({ pet_food: (child.pet_food || 0) + 1 }).eq('id', child.id).select();
    if (error) {
      console.log("Update Error:", error);
    } else {
      console.log("Update Success:", data);
    }
  } else {
    console.log("No child found.");
  }
}

test();
