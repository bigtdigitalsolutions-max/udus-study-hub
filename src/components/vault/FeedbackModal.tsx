import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  "Report Missing Pages / Error",
  "Suggest a Feature",
  "General Observation",
] as const;

export function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!message.trim()) {
      toast.error("Type a short message first");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("observations").insert({
      category,
      message: message.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Feedback could not be sent", { description: "Please try again." });
      return;
    }
    setMessage("");
    setCategory(CATEGORIES[0]);
    onClose();
    toast.success("Feedback sent anonymously", {
      description: "Thanks — the vault team reviews every observation.",
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-ink/70 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-cream p-5 text-ink">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Anonymous · no login
            </p>
            <h2 className="mt-1 font-display text-lg font-extrabold">Feedback &amp; Observation</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-ink/10 px-3 py-1.5 font-mono text-[11px]"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={
                category === c
                  ? "w-full rounded-2xl bg-ink px-4 py-3 text-left font-mono text-[12px] font-bold text-cream"
                  : "w-full rounded-2xl bg-ink/[0.07] px-4 py-3 text-left font-mono text-[12px] text-ink/70"
              }
            >
              {c}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          aria-label="Your message"
          placeholder="What did you notice? Be as specific as you like — page numbers help."
          className="mt-3 w-full resize-none rounded-2xl bg-ink/[0.07] px-4 py-3 text-[13px] outline-none placeholder:text-ink/40"
        />

        <button
          onClick={submit}
          disabled={submitting}
          className="glossy mt-3 w-full rounded-2xl py-3 font-mono text-[12px] font-bold text-ink"
        >
          {submitting ? "Sending…" : "Submit feedback"}
        </button>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink/40">
          No login or identifying details are collected
        </p>
      </div>
    </div>
  );
}
