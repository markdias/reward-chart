import * as dotenv from 'dotenv';
dotenv.config();

const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/reward_redemptions?select=*&limit=5`;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

fetch(url, {
  method: "GET",
  headers: {
    "apikey": anonKey,
    "Authorization": `Bearer ${anonKey}`,
    "Content-Type": "application/json"
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
