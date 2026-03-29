const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log("Checking DB insert...");
  // 1. Sign up/in a dummy user to get an ID if RLS requires it.
  const { data: authData, error: authErr } = await supabase.auth.signUp({ email: 'debug@test.com', password: 'password123' });
  const user = authData?.user;
  if (!user) {
    console.log("Auth error:", authErr);
    return;
  }
  
  console.log("User ID:", user.id);

  // 2. Test inserting into tasks
  const { error: tErr } = await supabase.from('tasks').insert({
    user_id: user.id,
    title: "Test Task",
    completed: true,
    updated_at: new Date().toISOString()
  });
  console.log("Tasks insert error:", tErr);

  // 3. Test upserting into levels
  const { error: lErr } = await supabase.from('levels').upsert({
    user_id: user.id,
    total_xp: 100,
    current_level: 2,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
  console.log("Levels upsert error:", lErr);
}

testSupabase();
