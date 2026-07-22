import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing URL or KEY");
  process.exit(1);
}

async function test() {
  console.log(`Testing raw fetch to ${url}/auth/v1/signup...`);
  
  try {
    const res = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'password123'
      })
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${text}`);
  } catch (err) {
    console.log("Fetch failed:", err.message);
  }
}

test();
