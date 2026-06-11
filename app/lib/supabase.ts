import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

// A single anon (read-only) client. Server components fetch with this at request time.
export const supabase = supabaseConfigured
  ? createClient(url as string, anon as string)
  : null;
