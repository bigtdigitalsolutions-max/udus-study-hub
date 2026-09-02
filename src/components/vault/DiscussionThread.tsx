import { useState } from "react";
import type { Course } from "@/lib/vault-data";
import { useLocalState } from "@/lib/vault-storage";

type Post = { id: string; initial: string; body: string; at: number };

const INITIALS = "ABCDEFGHJKLMNPQRSTVWXYZ";

function ago(at: number) {
  const mins = Math.max(1, Math.round((Date.now() - at) / 60_000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

export function DiscussionThread({ course }: { course: Course }) {
  const [posts, setPosts] = useLocalState<Post[]>(`thread:${course.id}`, []);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    setPosts((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        initial: INITIALS[Math.floor(Math.random() * INITIALS.length)],
        body,
        at: Date.now(),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="mt-4 border-t border-ink/10 pt-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
        Anonymous vault talks
      </p>

      <div className="mt-2 space-y-2.5">
        {course.seedThread.map((p, i) => (
          <Bubble key={`seed-${i}`} initial={p.initial} body={p.body} meta={p.ago} accent={i % 2 === 1} />
        ))}
        {posts.map((p) => (
          <Bubble key={p.id} initial={p.initial} body={p.body} meta={ago(p.at)} accent />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-full bg-ink/10 px-3 py-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Ask anonymously…"
          aria-label={`Ask an anonymous question about ${course.code}`}
          className="w-full bg-transparent text-[12px] text-ink outline-none placeholder:text-ink/40"
        />
        <button
          onClick={submit}
          className="shrink-0 rounded-full bg-ink px-3 py-1 font-mono text-[10px] font-bold text-cream"
        >
          Post
        </button>
      </div>
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink/35">
        No login · no names · stays on your device
      </p>
    </div>
  );
}

function Bubble({
  initial,
  body,
  meta,
  accent,
}: {
  initial: string;
  body: string;
  meta: string;
  accent?: boolean;
}) {
  return (
    <div className="flex gap-2.5">
      <div
        className={`grid size-7 shrink-0 place-items-center rounded-full font-display text-[10px] font-extrabold ${
          accent ? "bg-accent text-accent-foreground" : "chrome text-ink"
        }`}
      >
        {initial}
      </div>
      <div className="flex-1 rounded-2xl rounded-tl-sm bg-ink/[0.06] px-3 py-2">
        <p className="text-[12px] leading-snug">{body}</p>
        <p className="mt-1 font-mono text-[9px] text-ink/40">anonymous · {meta}</p>
      </div>
    </div>
  );
}
