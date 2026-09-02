import { useState } from "react";
import type { Course } from "@/lib/vault-data";

export function QuizCard({ course, onClose }: { course: Course; onClose: () => void }) {
  const quiz = course.quiz ?? [];
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const card = quiz[index];
  if (!card) return null;

  const next = () => {
    setRevealed(false);
    setIndex((i) => (i + 1) % quiz.length);
  };

  return (
    <section className="mt-4 rounded-3xl bg-ink/45 p-4 ring-1 ring-cream/15">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">
          Quick-quiz · {course.code}
        </p>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-cream/60">
            {index + 1} / {quiz.length}
          </span>
          <button onClick={onClose} className="font-mono text-[11px] text-cream/50 underline">
            close
          </button>
        </div>
      </div>

      <div className="chrome mt-3 rounded-2xl p-4 text-ink">
        <p className="font-mono text-[11px] font-bold uppercase tracking-wider">
          {revealed ? "Answer" : "Past question"}
        </p>
        <p className="mt-1 font-display text-[15px] font-bold leading-snug">
          {revealed ? card.answer : card.question}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={next}
          className="rounded-xl bg-cream/10 py-2.5 font-mono text-[12px] ring-1 ring-cream/20"
        >
          Skip
        </button>
        <button
          onClick={() => (revealed ? next() : setRevealed(true))}
          className="glossy rounded-xl py-2.5 font-mono text-[12px] font-bold text-ink"
        >
          {revealed ? "Next card" : "Reveal"}
        </button>
      </div>
    </section>
  );
}
