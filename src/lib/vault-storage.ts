import { useCallback, useEffect, useState } from "react";

const PREFIX = "udus-study-vault:";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

/** SSR-safe persisted state. Reads storage only after hydration. */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

export type StreakState = {
  lastDay: string;
  streak: number;
  minutesToday: number;
  history: string[];
};

export const emptyStreak: StreakState = {
  lastDay: "",
  streak: 0,
  minutesToday: 0,
  history: [],
};

export function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

/** Roll the streak forward for today's visit. */
export function checkIn(state: StreakState): StreakState {
  const today = dayKey();
  if (state.lastDay === today) return state;
  const gap = state.lastDay ? daysBetween(state.lastDay, today) : Infinity;
  const streak = gap === 1 ? state.streak + 1 : 1;
  return {
    lastDay: today,
    streak,
    minutesToday: 0,
    history: [...state.history.filter((d) => d !== today), today].slice(-30),
  };
}

/** The trailing 7 calendar days, flagged when studied. */
export function lastSevenDays(history: string[]) {
  const out: { day: string; active: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    out.push({ day: key, active: history.includes(key) });
  }
  return out;
}
