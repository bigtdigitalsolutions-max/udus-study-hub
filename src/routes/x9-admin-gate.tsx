import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DEPARTMENTS } from "@/lib/departments";
import {
  adminDeleteHandout,
  adminListHandouts,
  adminListObservations,
  adminLock,
  adminStatus,
  adminUnlock,
  adminUploadHandout,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/x9-admin-gate")({
  head: () => ({
    meta: [
      { title: "Vault Administration" },
      { name: "description", content: "Private administration area for UDUS Study Vault." },
      { property: "og:title", content: "Vault Administration" },
      { property: "og:description", content: "Private administration area for UDUS Study Vault." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminGate,
});

type Handout = {
  id: string;
  course_code: string;
  course_title: string | null;
  level: string;
  department: string | null;
  created_at: string;
};

type Observation = {
  id: string;
  category: string;
  message: string;
  created_at: string;
};

function AdminGate() {
  const getStatus = useServerFn(adminStatus);
  const unlock = useServerFn(adminUnlock);
  const lock = useServerFn(adminLock);
  const getHandouts = useServerFn(adminListHandouts);
  const getObservations = useServerFn(adminListObservations);
  const upload = useServerFn(adminUploadHandout);
  const remove = useServerFn(adminDeleteHandout);

  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [handouts, setHandouts] = useState<Handout[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const [nextHandouts, nextObservations] = await Promise.all([getHandouts(), getObservations()]);
      setHandouts(nextHandouts as Handout[]);
      setObservations(nextObservations as Observation[]);
    } catch {
      toast.error("Could not load the admin data");
    }
  }

  useEffect(() => {
    void getStatus()
      .then((result) => {
        setUnlocked(result.unlocked);
        if (result.unlocked) void refresh();
      })
      .catch(() => setUnlocked(false))
      .finally(() => setChecking(false));
    // The server functions are stable for this page lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitPasscode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await unlock({ data: { passcode } });
      if (!result.ok) {
        toast.error("That passcode is not correct");
        return;
      }
      setPasscode("");
      setUnlocked(true);
      await refresh();
    } catch {
      toast.error("The admin gate is unavailable");
    } finally {
      setBusy(false);
    }
  }

  async function submitUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    try {
      await upload({ data: new FormData(form) });
      form?.reset();
      toast.success("Handout uploaded");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteHandout(id: string) {
    setBusy(true);
    try {
      await remove({ data: { id } });
      setHandouts((current) => current.filter((item) => item.id !== id));
      toast.success("Handout removed");
    } catch {
      toast.error("Could not remove that handout");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await lock();
    setUnlocked(false);
    setHandouts([]);
    setObservations([]);
  }

  if (checking) {
    return <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">Checking gate…</main>;
  }

  if (!unlocked) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background p-5 text-foreground">
        <div className="dusk-bg absolute inset-0 opacity-80" />
        <form onSubmit={submitPasscode} className="relative z-10 w-full max-w-sm rounded-3xl bg-cream p-6 text-ink shadow-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Restricted area</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold">Vault admin gate</h1>
          <p className="mt-2 text-sm text-ink/60">Enter the administrator passcode to continue.</p>
          <label className="mt-6 block font-mono text-[11px] font-bold uppercase tracking-wide" htmlFor="admin-passcode">
            Passcode
          </label>
          <input
            id="admin-passcode"
            name="passcode"
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-2xl bg-ink/[0.07] px-4 py-3 outline-none ring-accent focus:ring-2"
          />
          <button disabled={busy} className="glossy mt-4 w-full rounded-2xl py-3 font-mono text-[12px] font-bold text-ink">
            {busy ? "Checking…" : "Unlock dashboard"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">UDUS Study Vault</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold">Admin dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage secure handouts and student observations.</p>
          </div>
          <button onClick={() => void signOut()} className="rounded-full px-3 py-2 font-mono text-[11px] ring-1 ring-border">
            Lock dashboard
          </button>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form onSubmit={submitUpload} className="rounded-3xl bg-cream p-5 text-ink shadow-xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Content library</p>
            <h2 className="mt-1 font-display text-xl font-extrabold">Upload a PDF</h2>
            <div className="mt-4 space-y-3">
              <input name="course_code" required placeholder="Course code · e.g. GST 101" className="w-full rounded-xl bg-ink/[0.07] px-3 py-3 text-sm outline-none" />
              <input name="course_title" placeholder="Course title (optional)" className="w-full rounded-xl bg-ink/[0.07] px-3 py-3 text-sm outline-none" />
              <select name="level" defaultValue="100L" className="w-full rounded-xl bg-ink/[0.07] px-3 py-3 text-sm outline-none">
                {["100L", "200L", "300L", "400L", "500L"].map((level) => <option key={level}>{level}</option>)}
              </select>
              <select name="department" defaultValue="" required className="w-full rounded-xl bg-ink/[0.07] px-3 py-3 text-sm outline-none">
                <option value="" disabled>Select department</option>
                {DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}
              </select>
              <input name="file" type="file" accept="application/pdf,.pdf" required className="w-full rounded-xl bg-ink/[0.07] px-3 py-3 text-sm" />
            </div>
            <button disabled={busy} className="glossy mt-4 w-full rounded-xl py-3 font-mono text-[12px] font-bold text-ink">
              {busy ? "Working…" : "Upload handout"}
            </button>
          </form>

          <section className="rounded-3xl border border-border bg-card/10 p-5">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">Library</p>
                <h2 className="mt-1 font-display text-xl font-extrabold">Uploaded handouts</h2>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">{handouts.length} total</span>
            </div>
            <div className="mt-4 space-y-2">
              {handouts.length === 0 && <p className="text-sm text-muted-foreground">No PDFs uploaded yet.</p>}
              {handouts.map((handout) => (
                <div key={handout.id} className="flex items-center justify-between gap-3 rounded-2xl bg-card/10 p-3 ring-1 ring-border">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold text-brand">{handout.course_code} · {handout.level}</p>
                    <p className="truncate text-sm">{handout.course_title || "Untitled handout"}</p>
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{handout.department || "Department not assigned"}</p>
                  </div>
                  <button onClick={() => void deleteHandout(handout.id)} disabled={busy} className="shrink-0 rounded-lg px-2 py-1.5 font-mono text-[10px] text-destructive ring-1 ring-destructive/30">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="mt-5 rounded-3xl border border-border bg-card/10 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">Student inbox</p>
              <h2 className="mt-1 font-display text-xl font-extrabold">Observations</h2>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">{observations.length} recent</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {observations.length === 0 && <p className="text-sm text-muted-foreground">No observations submitted yet.</p>}
            {observations.map((observation) => (
              <article key={observation.id} className="rounded-2xl bg-card/10 p-4 ring-1 ring-border">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-brand">{observation.category}</p>
                  <time className="font-mono text-[10px] text-muted-foreground">{new Date(observation.created_at).toLocaleDateString()}</time>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{observation.message}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}