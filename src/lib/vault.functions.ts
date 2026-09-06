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
    .select("id, course_code, course_title, level, department, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

/** Returns PDF bytes without exposing the private storage path or a signed URL. */
export const getHandoutDocument = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("handouts")
      .select("file_path")
      .eq("id", data.id)
      .maybeSingle();
    if (!row?.file_path) throw new Error("Handout not found");
    const downloaded = await supabaseAdmin.storage.from("handouts").download(row.file_path);
    if (downloaded.error) throw new Error(downloaded.error.message);

    const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
    let binary = "";
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return { base64: btoa(binary) };
  });
