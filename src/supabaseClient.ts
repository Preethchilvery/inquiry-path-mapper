import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://leeevxzsaxsjgsdjipoh.supabase.co'; // 🔁 Replace with your Supabase Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZWV2eHpzYXhzamdzZGppcG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzgyNTQsImV4cCI6MjA2NDgxNDI1NH0.tgAIAVxVdySEYspXswWX8pbTOd2c6lkjyVGZ1mLABqI';               // 🔁 Replace with your Anon Public Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
