import * as dotenv from 'dotenv';
dotenv.config();

const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/parent_profiles?user_id=eq.00000000-0000-0000-0000-000000000000`;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

fetch(url, {
  method: "PATCH",
  headers: {
    "apikey": anonKey,
    "Authorization": `Bearer ${anonKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  },
  body: JSON.stringify({
          level_up_gold_reward: 500,
          points_to_level_up: 500,
          savings_pot_unlock_level: 2,
          food_pot_unlock_level: 4,
          gifting_pot_unlock_level: 6
  })
})
.then(res => res.json().then(data => ({status: res.status, data})))
.then(console.log)
.catch(console.error);
