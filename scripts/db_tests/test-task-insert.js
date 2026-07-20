import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  console.log("Testing tasks insert...");
  const newTask = {
    id: `task_test_${Date.now()}`,
    parent_id: 'test@example.com',
    child_ids: ['child_1', 'child_2'],
    title: 'Test Task',
    points: 10,
    category: 'daily',
    recurrence: 'daily',
    is_active: true,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('tasks').insert(newTask).select();
  if (error) {
    console.log("DB Insert Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("DB Insert Success!", data);
  }
}

test();
