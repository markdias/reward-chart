import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  console.log("Testing reward_redemptions insert...");
  const newRedemption = {
    id: `red_test_${Date.now()}`,
    reward_id: 'reward_123',
    child_id: 'child_123',
    parent_id: 'test@example.com',
    redeemed_at: new Date().toISOString(),
    status: 'requested'
  };

  const { data, error } = await supabase.from('reward_redemptions').insert(newRedemption).select();
  if (error) {
    console.log("DB Insert Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("DB Insert Success!");
  }
}

test();
