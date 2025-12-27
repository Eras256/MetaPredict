import { createClient } from '@supabase/supabase-js';

// Supabase client para frontend (usa publishable key o legacy anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ixfgjkxtzbngsbannbip.supabase.co';

// Soporta tanto la nueva publishable key como la legacy anon key
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  // Fallback a legacy anon key si no está configurada
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Zmdqa3h0emJuZ3NiYW5uYmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjgwODksImV4cCI6MjA4MjQ0NDA4OX0.Lsy0VDcmbp4ICgQjTKi7Jn2lUEjKjceUjzJ_YRcHpTI';

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada. Usando legacy anon key como fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

