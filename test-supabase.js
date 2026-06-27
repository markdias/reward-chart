import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing URL or KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  console.log("Testing signup...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: `test-${Date.now()}@example.com`,
    password: 'password123'
  });
  if (authError) {
    console.log("Signup Error:", JSON.stringify(authError, null, 2));
  } else {
    console.log("Signup Success:", !!authData.session);
  }

  console.log("Testing children...");
  const { data: dbData, error: dbError } = await supabase.from('children').select('id').limit(1);
  if (dbError) {
    console.log("DB Error:", JSON.stringify(dbError, null, 2));
  } else {
    console.log("DB Success:", dbData);
  }
}

test();
