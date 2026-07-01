const url = "https://qnbpenvudqrngbxelvnx.supabase.co/rest/v1/parent_profiles?user_id=eq.00000000-0000-0000-0000-000000000000";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYnBlbnZ1ZHFybmdieGVsdm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjEzMTEsImV4cCI6MjA5Nzg5NzMxMX0.cyhwH_AlkBR-xZ82VbFgYtI9V4_VZp9D_fGO24f8OW4";

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
