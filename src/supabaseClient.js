import { createClient } from "@supabase/supabase-js";

// Vite exposes only variables prefixed with VITE_ to the browser.
// These are read from the .env file at the project root (never committed).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in the console if the .env values are missing.
  console.error(
    "Missing Supabase env vars. Make sure VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_ANON_KEY are set in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
