import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  console.log("Testing children insert...");
  const newChild = {
    id: `child_test_${Date.now()}`,
    parent_id: 'test@example.com',
    name: 'Test Child',
    avatar_url: 'test.png',
    character_id: 'dragon',
    points: 0,
    level: 1,
    xp_in_level: 0,
    streak_days: 0,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('children').insert(newChild).select();
  if (error) {
    console.log("DB Insert Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("DB Insert Success!", data);
  }
}

test();
