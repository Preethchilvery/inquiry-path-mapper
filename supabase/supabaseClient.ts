import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ozmxxalzogcwotxrdpuu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bXh4YWx6b2djd290eHJkcHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzg1OTcsImV4cCI6MjA2NDg1NDU5N30.2S4nkrGZtfSmonp0TwjhnnztCgr_ajyjN2KcbszuzW4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 