import type { Course } from "@/lib/vault-data";
import { DiscussionThread } from "./DiscussionThread";

type Props = {
  course: Course;
  onRead: () => void;
  onQuiz: () => void;
};

export function CourseCard({ course, onRead, onQuiz }: Props) {
  return (
    <section className="mt-4 rounded-3xl bg-cream p-4 text-ink shadow-xl">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-wide text-accent">{course.code}</p>
          <h2 className="mt-0.5 font-display text-lg font-extrabold">{course.title}</h2>
          <p className="mt-1 font-mono text-[10px] text-ink/45">
            {course.units > 0 ? `${course.units} units · ` : "Secure upload · "}
            {course.handouts} handout{course.handouts === 1 ? "" : "s"} · {course.level}
          </p>
        </div>
        {course.quiz && (
          <button
            onClick={onQuiz}
            className="glossy shrink-0 rounded-full px-3 py-1.5 font-mono text-[11px] font-bold text-ink"
          >
            Quiz
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
        <button
          onClick={onRead}
          className="rounded-full bg-ink/10 px-3 py-1.5 font-semibold"
        >
          Read notes
        </button>
        <button
          onClick={onRead}
          className="rounded-full bg-ink/10 px-3 py-1.5 font-semibold"
        >
          PDF reader
        </button>
      </div>

      <DiscussionThread course={course} />
    </section>
  );
}
