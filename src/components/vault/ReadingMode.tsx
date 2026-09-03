import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Course } from "@/lib/vault-data";
import { listHandouts, getHandoutUrl } from "@/lib/vault.functions";
import { PdfCanvasViewer } from "./PdfCanvasViewer";

type Props = {
  course: Course;
  onClose: () => void;
  onRead: () => void;
};

export function ReadingMode({ course, onClose, onRead }: Props) {
  const [page, setPage] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const total = course.pages.length;
  const fetchHandouts = useServerFn(listHandouts);
  const fetchHandoutUrl = useServerFn(getHandoutUrl);

  useEffect(() => {
    onRead();
    void (async () => {
      try {
        const handouts = await fetchHandouts();
        const match = handouts.find((handout) => handout.course_code.toLowerCase() === course.code.toLowerCase());
        if (match) {
          const signed = await fetchHandoutUrl({ data: { id: match.id } });
          setPdfUrl(signed.url);
        }
      } catch {
        // The built-in notes remain available when no uploaded PDF is reachable.
      } finally {
        setPdfLoading(false);
      }
    })();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && ["p", "c", "s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === "PrintScreen") e.preventDefault();
    };
    const onBeforePrint = (e: Event) => e.preventDefault();
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeprint", onBeforePrint);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeprint", onBeforePrint);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="secure-reading-surface fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm">
      <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0">
           <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">
             {pdfUrl ? "Secure PDF reader" : "Reading mode"}
           </p>
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


         {pdfLoading && (
           <p className="font-mono text-[11px] text-ink/50">Checking for the latest handout…</p>
         )}
         {pdfUrl ? (
           <PdfCanvasViewer url={pdfUrl} />
         ) : (
           <div className="relative">
             <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
               Page {page + 1} of {total}
             </p>
             <p className="mt-3 text-[14px] leading-relaxed text-ink/85">{course.pages[page]}</p>
           </div>
         )}
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-4">
         {!pdfUrl ? (
           <button
             onClick={() => setPage((p) => Math.max(0, p - 1))}
             disabled={page === 0}
             className="rounded-xl bg-cream/10 px-4 py-2.5 font-mono text-[12px] ring-1 ring-cream/20 disabled:opacity-40"
           >
             Prev
           </button>
         ) : <span />}
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/50">
          Copy protected
        </span>
         {!pdfUrl ? (
           <button
             onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
             disabled={page === total - 1}
             className="glossy rounded-xl px-4 py-2.5 font-mono text-[12px] font-bold text-ink disabled:opacity-40"
           >
             Next
           </button>
         ) : <span />}
      </div>
    </div>
  );
}
