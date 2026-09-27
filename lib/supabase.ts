import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public bucket holding uploaded media (article covers, ...); objects are served by their public URL.
export const SUPABASE_BUCKET = "ailene";

let client: SupabaseClient | null = null;

// Created on first use so a missing env var fails the upload, not every page that imports this.
export function getSupabase() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error("Supabase is not configured");
    }
    client = createClient(url, anonKey);
  }
  return client;
}
