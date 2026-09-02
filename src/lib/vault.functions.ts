import { createServerFn } from "@tanstack/react-start";

/** Public list of available handouts (metadata only, no file access). */
export const listHandouts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("handouts")
    .select("id, course_code, course_title, level, file_path, created_at")
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
