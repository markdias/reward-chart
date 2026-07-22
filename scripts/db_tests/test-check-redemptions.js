import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data: reds } = await supabase.from('reward_redemptions').select('*');
  const { data: rews } = await supabase.from('rewards').select('*');
  
  console.log("Redemptions:", reds);
  console.log("Rewards:", rews);
}

test();
