/**
 * Centralized Supabase Configuration & Fallbacks
 * Menjamin koneksi database terpusat yang sama di seluruh perangkat (Laptop, HP, Vercel Production, dan Localhost).
 */

export const DEFAULT_SUPABASE_URL = 'https://rwcsmysyuompixkzlmmv.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y3NteXN5dW9tcGl4a3psbW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMzY5NTMsImV4cCI6MjEwNzcxMjk1M30.8ECi8otJqBKCIz2gosBo5RWZpMzCNakikln9KqKbdN0';

export function getSupabaseServerConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(url) && Boolean(key) && !url.includes('your-supabase-project');

  return { url, key, isConfigured };
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(url) && Boolean(key) && !url.includes('your-supabase-project');

  return { url, key, isConfigured };
}
