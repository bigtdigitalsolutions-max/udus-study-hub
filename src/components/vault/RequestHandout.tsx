import { useState } from "react";
import { useLocalState } from "@/lib/vault-storage";

type Request = { id: string; code: string; note: string };

export function RequestHandout() {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useLocalState<Request[]>("handout-requests", []);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!code.trim()) return;
    setRequests((prev) => [...prev, { id: `${Date.now()}`, code: code.trim(), note: note.trim() }]);
    setCode("");
    setNote("");
    setSent(true);
  };

  return (
    <>
      <button
        onClick={() => {
          setSent(false);
          setOpen(true);
        }}
        className="glossy fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full py-3 pl-4 pr-5"
      >
        <span className="font-mono text-sm font-bold text-ink">+</span>
        <span className="whitespace-nowrap font-mono text-[12px] font-bold text-ink">
          Request handout
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-ink/70 backdrop-blur-sm">
          <div className="w-full rounded-t-3xl bg-cream p-5 text-ink">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  Anonymous request
                </p>
                <h2 className="mt-1 font-display text-lg font-extrabold">Missing a handout?</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-ink/10 px-3 py-1.5 font-mono text-[11px]"
              >
                Close
              </button>
            </div>

            {sent ? (
              <p className="mt-4 text-[13px] leading-relaxed text-ink/70">
                Request logged anonymously. {requests.length} request
                {requests.length === 1 ? "" : "s"} queued from this device — we'll surface the notes
                in the vault once uploaded.
              </p>
            ) : (
              <>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Course code — e.g. MTH 205"
                  aria-label="Course code"
                  className="mt-4 w-full rounded-2xl bg-ink/[0.07] px-4 py-3 text-[13px] outline-none placeholder:text-ink/40"
                />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What exactly is missing? (optional)"
                  aria-label="Request details"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl bg-ink/[0.07] px-4 py-3 text-[13px] outline-none placeholder:text-ink/40"
                />
                <button
                  onClick={submit}
                  className="glossy mt-3 w-full rounded-2xl py-3 font-mono text-[12px] font-bold text-ink"
                >
                  Send anonymously
                </button>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink/40">
                  No name, no matric number, no login
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
