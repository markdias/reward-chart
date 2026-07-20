import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data: reds } = await supabase.from('reward_redemptions').select('*').limit(1);
  const { data: rews } = await supabase.from('rewards').select('*');
  const { data: kids } = await supabase.from('children').select('*');
  
  if (!reds || reds.length === 0) return;
  const redemption = reds[0];
  const reward = rews.find(r => r.id === redemption.reward_id);
  const child = kids.find(c => c.id === redemption.child_id);
  
  console.log("Redemption:", redemption.id);
  console.log("Reward found:", !!reward);
  console.log("Child found:", !!child);
  
  if (reward && child) {
    const targetChild = {
      ...child,
      points: Math.max(0, child.points - reward.cost_points),
      pet_food: (child.pet_food || 0) + 1,
    };
    targetChild.level = Math.floor(targetChild.points / 100) + 1;
    targetChild.xp_in_level = targetChild.points % 100;
    
    console.log("Target child:", targetChild);
  }
}

test();
