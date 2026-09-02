import { useEffect, useState } from "react";
import type { Course } from "@/lib/vault-data";

type Props = {
  course: Course;
  onClose: () => void;
  onRead: () => void;
};

export function ReadingMode({ course, onClose, onRead }: Props) {
  const [page, setPage] = useState(0);
  const total = course.pages.length;

  useEffect(() => {
    onRead();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm">
      <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">Reading mode</p>
          <h2 className="truncate font-display text-base font-extrabold">
            {course.code} · Handout
          </h2>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-full bg-cream/10 px-3 py-1.5 font-mono text-[11px] ring-1 ring-cream/20"
        >
          Close
        </button>
      </header>

      <div
        className="no-select relative mx-4 flex-1 overflow-y-auto rounded-3xl bg-cream p-4 text-ink"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grid -rotate-[18deg] place-items-center overflow-hidden opacity-[0.08]"
        >
          <div>
            {[0, 1, 2, 3].map((i) => (
              <p
                key={i}
                className="mt-10 whitespace-nowrap font-display text-[24px] font-extrabold leading-none text-ink"
              >
                UDUS Study Vault · UDUS Study Vault
              </p>
            ))}
          </div>
        </div>


        <div className="relative">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
            Page {page + 1} of {total}
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink/85">{course.pages[page]}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded-xl bg-cream/10 px-4 py-2.5 font-mono text-[12px] ring-1 ring-cream/20 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/50">
          Copy protected
        </span>
        <button
          onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
          disabled={page === total - 1}
          className="glossy rounded-xl px-4 py-2.5 font-mono text-[12px] font-bold text-ink disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
