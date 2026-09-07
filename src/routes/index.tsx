import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { COURSES, LEVELS, type Course, type Level } from "@/lib/vault-data";
import { listHandouts } from "@/lib/vault.functions";
import {
  checkIn,
  emptyStreak,
  lastSevenDays,
  useLocalState,
  type StreakState,
} from "@/lib/vault-storage";
import { StreakTracker } from "@/components/vault/StreakTracker";
import { CourseCard } from "@/components/vault/CourseCard";
import { QuizCard } from "@/components/vault/QuizCard";
import { ReadingMode } from "@/components/vault/ReadingMode";
import { RequestHandout } from "@/components/vault/RequestHandout";
import { FeedbackModal } from "@/components/vault/FeedbackModal";
import { InstallBanner } from "@/components/vault/InstallBanner";

type UploadedHandout = {
  id: string;
  course_code: string;
  course_title: string | null;
  level: string;
  department: string | null;
  created_at: string;
};

const TITLE = "UDUS Study Vault — Course Handouts, Past Questions & Peer Q&A";
const DESCRIPTION =
  "Mobile-first study portal for UDUS students: handouts by level, anonymous course discussions, protected reading mode, GST quick-quizzes and a daily study streak.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [level, setLevel] = useState<Level>("100L");
  const [query, setQuery] = useState("");
  const [reading, setReading] = useState<Course | null>(null);
  const [quizFor, setQuizFor] = useState<string | null>("gst101");
  const [streak, setStreak] = useLocalState<StreakState>("streak", emptyStreak);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    setStreak((prev) => checkIn(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const courses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSES.filter((c) => {
      const matchesQuery =
        !q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
      return matchesQuery && (q ? true : c.level === level);
    });
  }, [query, level]);

  const quizCourse = COURSES.find((c) => c.id === quizFor && c.quiz);
  const week = lastSevenDays(streak.history);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="dusk-bg absolute inset-0" />
      <div className="dusk-glow absolute inset-0" />
      <div className="chrome absolute -bottom-40 left-1/2 size-[460px] -translate-x-1/2 rounded-full opacity-70 blur-[1px]" />

      <div className="relative z-10 px-4 pt-4 pb-28">
        <header className="flex items-center gap-3">
          <div className="chrome grid size-11 shrink-0 place-items-center rounded-2xl shadow-lg">
            <span className="font-display text-lg font-extrabold text-ink">SV</span>
          </div>
          <div className="leading-none">
            <h1 className="font-display text-[19px] font-extrabold tracking-tight">Study Vault</h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/70">
              UDUS Portal
            </p>
          </div>
          <button
            onClick={() => setFeedbackOpen(true)}
            className="ml-auto shrink-0 rounded-full px-3 py-2 font-mono text-[11px] text-cream/80 ring-1 ring-cream/20"
          >
            Feedback
          </button>
        </header>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-ink/40 px-3 py-3 ring-1 ring-cream/15 backdrop-blur-sm">
          <span className="font-mono text-sm text-cream/60">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search course codes"
            className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-cream/45"
            placeholder="Search course code — e.g. GST 101"
          />
        </div>

        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLevel(l);
                setQuery("");
              }}
              className={
                l === level && !query
                  ? "glossy shrink-0 rounded-full px-4 py-2 font-mono text-[12px] font-bold text-ink"
                  : "shrink-0 rounded-full px-4 py-2 font-mono text-[12px] text-cream/70 ring-1 ring-cream/15"
              }
            >
              {l}
            </button>
          ))}
        </div>

        <StreakTracker streak={streak.streak} minutesToday={streak.minutesToday} week={week} />

        {courses.length === 0 && (
          <p className="mt-6 font-mono text-[12px] text-cream/60">
            No course matches “{query}”. Try the handout request button below.
          </p>
        )}

        {courses.map((c) => (
          <div key={c.id}>
            <CourseCard
              course={c}
              onRead={() => setReading(c)}
              onQuiz={() => setQuizFor(c.id)}
            />
            {quizCourse?.id === c.id && (
              <QuizCard course={quizCourse} onClose={() => setQuizFor(null)} />
            )}
          </div>
        ))}
      </div>

      <RequestHandout />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <InstallBanner />

      <footer className="relative z-10 pb-8 pt-6 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-cream/15 bg-plum/40 px-5 py-4 backdrop-blur-sm">
          <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-cream">
            Powered by{" "}
            <span className="chrome-text bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              BIG T Digital Solutions
            </span>
          </p>
        </div>
      </footer>

      {reading && (
        <ReadingMode
          course={reading}
          onClose={() => setReading(null)}
          onRead={() =>
            setStreak((prev) => ({ ...prev, minutesToday: prev.minutesToday + 5 }))
          }
        />
      )}
    </div>
  );
}
