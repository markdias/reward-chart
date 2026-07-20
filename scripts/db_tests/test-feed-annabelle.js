import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data: childData } = await supabase.from('children').select('*').eq('name', 'Annabelle');
  if (childData && childData.length > 0) {
    const child = childData[0];
    const targetChild = { ...child, pet_food: 0 };
    const { data, error } = await supabase.from('children').update(targetChild).eq('id', child.id).select();
    console.log("Update Success:", data);
  }
}

test();
