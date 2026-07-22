import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  console.log("Testing completions insert...");
  const newCompletion = {
    id: `comp_test_${Date.now()}`,
    task_id: 'task_123',
    child_id: 'child_123',
    completed_at: new Date().toISOString(),
    status: 'pending',
    points_awarded: 10
  };

  const { data, error } = await supabase.from('completions').insert(newCompletion).select();
  if (error) {
    console.log("DB Insert Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("DB Insert Success!");
  }
}

test();
