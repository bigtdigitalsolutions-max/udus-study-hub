type Props = {
  streak: number;
  minutesToday: number;
  week: { day: string; active: boolean }[];
};

export function StreakTracker({ streak, minutesToday, week }: Props) {
  return (
    <section className="mt-5 rounded-3xl bg-ink/45 p-4 ring-1 ring-cream/15">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">
            Today's reading
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold">{minutesToday} min</p>
        </div>
        <div className="text-right">
          <p className="chrome-text font-display text-3xl font-extrabold">{streak}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream/60">
            day streak
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {week.map((d) => (
          <div
            key={d.day}
            className={`h-2 flex-1 rounded-full ${d.active ? "chrome" : "bg-cream/15"}`}
          />
        ))}
      </div>
      <p className="mt-3 font-mono text-[10px] text-cream/50">
        Open a handout each day to keep the streak alive.
      </p>
    </section>
  );
}
