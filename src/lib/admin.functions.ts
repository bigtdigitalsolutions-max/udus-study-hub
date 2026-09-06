import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { DEPARTMENTS } from "@/lib/departments";

type GateSession = { unlocked?: boolean };

function sessionConfig() {
  const password = process.env["SESSION_SECRET"];
  if (!password) throw new Error("Admin session is not configured");
  return {
    password,
    name: "udus-admin-gate",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function matches(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

async function requireUnlocked() {
  const session = await useSession<GateSession>(sessionConfig());
  if (!session.data.unlocked) throw new Error("Locked");
  return session;
}

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  return { unlocked: Boolean(session.data.unlocked) };
});

export const adminUnlock = createServerFn({ method: "POST" })
  .inputValidator((data: { passcode: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSCODE"];
    if (!expected) throw new Error("Admin passcode is not configured");
    if (!matches(data.passcode ?? "", expected)) return { ok: false as const };
    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLock = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const adminListObservations = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("observations")
    .select("id, category, message, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminListHandouts = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("handouts")
    .select("id, course_code, course_title, level, department, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminDeleteHandout = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("handouts")
      .select("file_path")
      .eq("id", data.id)
      .maybeSingle();
    if (row?.file_path) await supabaseAdmin.storage.from("handouts").remove([row.file_path]);
    const { error } = await supabaseAdmin.from("handouts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminUploadHandout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected form data");
    return data;
  })
  .handler(async ({ data }) => {
    await requireUnlocked();

    const file = data.get("file");
    const courseCode = String(data.get("course_code") ?? "").trim();
    const courseTitle = String(data.get("course_title") ?? "").trim();
    const level = String(data.get("level") ?? "").trim();
    const department = String(data.get("department") ?? "").trim();

    if (!(file instanceof File)) throw new Error("Attach a PDF file");
    if (file.type !== "application/pdf") throw new Error("Only PDF files are accepted");
    if (!courseCode) throw new Error("Course code is required");
    if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
      throw new Error("Pick a valid department");
    }
    if (!["100L", "200L", "300L", "400L", "500L"].includes(level)) {
      throw new Error("Pick a valid level");
    }

    const slug = courseCode.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const path = `${level}/${slug}-${Date.now()}.pdf`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const up = await supabaseAdmin.storage
      .from("handouts")
      .upload(path, bytes, { contentType: "application/pdf", upsert: false });
    if (up.error) throw new Error(up.error.message);

    const { error } = await supabaseAdmin.from("handouts").insert({
      course_code: courseCode,
      course_title: courseTitle || null,
      level,
      department,
      file_path: path,
    });
    if (error) throw new Error(error.message);

    return { ok: true as const };
  });
