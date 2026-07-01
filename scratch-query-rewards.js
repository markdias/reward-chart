import * as dotenv from 'dotenv';
dotenv.config();

const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/rewards?select=*&title=eq.Choose%20a%20sweet%20treat`;
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
