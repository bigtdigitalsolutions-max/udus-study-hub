import { createServerFn } from "@tanstack/react-start";
import type { Database } from "@/integrations/supabase/types";

/** Public list of available handouts (metadata only, no file access). */
export const listHandouts = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Handout service is not configured");
  const publicClient = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const { data, error } = await publicClient
    .from("handouts")
    .select("id, course_code, course_title, level, department, file_path, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

/** Short-lived signed URL so the in-app canvas reader can stream a handout. */
export const getHandoutUrl = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("handouts")
      .select("file_path")
      .eq("id", data.id)
      .maybeSingle();
    if (!row?.file_path) throw new Error("Handout not found");
    const signed = await supabaseAdmin.storage
      .from("handouts")
      .createSignedUrl(row.file_path, 60 * 15);
    if (signed.error) throw new Error(signed.error.message);
    return { url: signed.data.signedUrl };
  });
