"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import BarChart, { type BarDatum } from "@/components/BarChart";
import SegmentedControl from "@/components/SegmentedControl";
import { WalkSheet } from "@/components/LogSheets";
import {
  addDays,
  formatLong,
  formatShort,
  fromKey,
  monthStart,
  rangeKeys,
  todayKey,
  toKey,
  weekStart,
} from "@/lib/dates";
import type { Profile, Session } from "@/lib/types";

type Period = "week" | "month" | "quarter" | "all";
type Metric = "steps" | "calories" | "distanceMi" | "durationMin";

const METRICS: { value: Metric; label: string; color: string; unit: string }[] = [
  { value: "steps", label: "Steps", color: "#7FAE74", unit: "" },
  { value: "calories", label: "Cal", color: "#E8A93C", unit: " cal" },
  { value: "distanceMi", label: "Miles", color: "#5BA8A0", unit: " mi" },
  { value: "durationMin", label: "Time", color: "#D98E5A", unit: " min" },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekdayLabel = (key: string) => WEEKDAYS[(fromKey(key).getDay() + 6) % 7];
const addMonths = (key: string, n: number) => {
  const d = fromKey(key);
  d.setMonth(d.getMonth() + n);
  return toKey(d);
};
const monthLabel = (key: string, withYear: boolean) =>
  fromKey(key).toLocaleDateString("en-US", { month: "short", ...(withYear ? { year: "2-digit" } : {}) });

export default function ActivityPage() {
  const today = todayKey();
  const [period, setPeriod] = useState<Period>("week");
  const [metric, setMetric] = useState<Metric>("steps");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [walkOpen, setWalkOpen] = useState(false);

  // Fetch window. "all" pulls everything; we bucket client-side.
  const from =
    period === "week"
      ? weekStart(today)
      : period === "month"
        ? addDays(today, -29)
        : period === "quarter"
          ? addDays(today, -90)
          : "2000-01-01";

  const load = useCallback(async () => {
    const [s, p] = await Promise.all([
      fetch(`/api/sessions?from=${from}&to=${today}`, { cache: "no-store" }),
      fetch("/api/profile", { cache: "no-store" }),
    ]);
    if (s.ok) setSessions(await s.json());
    if (p.ok) setProfile(await p.json());
  }, [from, today]);

  useEffect(() => {
    load();
  }, [load]);

  const meta = METRICS.find((m) => m.value === metric)!;
  const grouped = period === "quarter" || period === "all";

  // Bucketed chart data. Daily for week/30d, weekly for 3M, monthly for all-time.
  const bars = useMemo<BarDatum[]>(() => {
    const val = (s: Session) => s[metric] as number;
    const round = (v: number) => (metric === "distanceMi" ? Math.round(v * 100) / 100 : Math.round(v));

    if (period === "week" || period === "month") {
      const map = new Map<string, number>();
      for (const k of rangeKeys(from, today)) map.set(k, 0);
      for (const s of sessions) if (map.has(s.date)) map.set(s.date, (map.get(s.date) ?? 0) + val(s));
      return [...map.entries()].map(([date, v]) => ({
        label: period === "week" ? weekdayLabel(date) : formatShort(date),
        tip: formatLong(date),
        value: round(v),
      }));
    }

    if (period === "quarter") {
      const keys: string[] = [];
      const last = weekStart(today);
      for (let w = weekStart(from); w <= last; w = addDays(w, 7)) keys.push(w);
      const map = new Map(keys.map((k) => [k, 0]));
      for (const s of sessions) {
        const k = weekStart(s.date);
        if (map.has(k)) map.set(k, (map.get(k) ?? 0) + val(s));
      }
      return keys.map((k) => ({
        label: formatShort(k),
        tip: `Week of ${formatShort(k)}`,
        value: round(map.get(k) ?? 0),
      }));
    }

    // all-time: monthly buckets from earliest session month to current
    const earliest = sessions.length
      ? sessions.reduce((min, s) => (s.date < min ? s.date : min), sessions[0].date)
      : today;
    const keys: string[] = [];
    const last = monthStart(today);
    for (let m = monthStart(earliest); m <= last; m = addMonths(m, 1)) keys.push(m);
    const multiYear = keys.length > 0 && keys[0].slice(0, 4) !== last.slice(0, 4);
    const map = new Map(keys.map((k) => [k, 0]));
    for (const s of sessions) {
      const k = monthStart(s.date);
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + val(s));
    }
    return keys.map((k) => ({
      label: monthLabel(k, multiYear),
      tip: fromKey(k).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      value: round(map.get(k) ?? 0),
    }));
  }, [sessions, from, today, metric, period]);

  // Daily goal only maps onto daily views; hidden for weekly/monthly buckets.
  const dailyGoal =
    metric === "steps" ? profile?.stepGoal : metric === "calories" ? profile?.calorieGoal : undefined;
  const goal = grouped ? undefined : dailyGoal;

  const total = bars.reduce((a, d) => a + d.value, 0);
  const activeBuckets = bars.filter((d) => d.value > 0).length;
  const avg = activeBuckets ? total / activeBuckets : 0;
  const daysMet = goal ? bars.filter((d) => d.value >= goal).length : null;

  const avgLabel =
    period === "quarter" ? "Avg / active wk" : period === "all" ? "Avg / active mo" : "Avg / active day";
  const countLabel =
    period === "quarter" ? "Active wks" : period === "all" ? "Active mos" : "Active days";

  const fmt = (v: number) =>
    metric === "distanceMi"
      ? (Math.round(v * 10) / 10).toLocaleString()
      : Math.round(v).toLocaleString();

  return (
    <div>
      <h1 className="large-title mb-5">Activity</h1>

      <div className="mb-3 flex flex-col gap-2">
        <SegmentedControl
          options={[
            { value: "week", label: "Week" },
            { value: "month", label: "30 Days" },
            { value: "quarter", label: "3 Months" },
            { value: "all", label: "All Time" },
          ]}
          value={period}
          onChange={setPeriod}
        />
        <SegmentedControl
          options={METRICS.map((m) => ({ value: m.value, label: m.label }))}
          value={metric}
          onChange={setMetric}
        />
      </div>

      <div className="card mb-3 p-4">
        <BarChart data={bars} goal={goal ?? undefined} color={meta.color} formatValue={fmt} />
        <div className="mt-3 grid grid-cols-3 divide-x divide-sep/70 text-center">
          <div>
            <div className="text-[12px] font-medium text-secondary">Total</div>
            <div className="text-[17px] font-bold">{fmt(total)}{meta.unit}</div>
          </div>
          <div>
            <div className="text-[12px] font-medium text-secondary">{avgLabel}</div>
            <div className="text-[17px] font-bold">{fmt(avg)}{meta.unit}</div>
          </div>
          <div>
            <div className="text-[12px] font-medium text-secondary">
              {daysMet != null ? "Goal met" : countLabel}
            </div>
            <div className="text-[17px] font-bold">
              {daysMet != null ? `${daysMet} d` : `${activeBuckets}`}
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => setWalkOpen(true)} className="btn-primary mb-6 w-full">
        <Plus size={18} strokeWidth={2.6} /> Add Walk
      </button>

      <div className="section-label">Sessions</div>
      <div className="card">
        {sessions.length === 0 && (
          <div className="row justify-center py-8 text-[14px] text-secondary">
            No walks logged yet
          </div>
        )}
        {sessions.map((s) => (
          <div key={s.id} className="row">
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">
                {formatShort(s.date)} · {Math.round(s.durationMin)} min @ {s.speedMph} mph
              </div>
              <div className="text-[13px] text-secondary">
                {s.steps.toLocaleString()} steps · {s.distanceMi} mi · {s.calories} cal
              </div>
            </div>
            <button
              onClick={async () => {
                await fetch(`/api/sessions?id=${s.id}`, { method: "DELETE" });
                load();
              }}
              className="rounded-full p-2 text-tertiary transition hover:text-red active:scale-90"
              aria-label="Delete session"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <WalkSheet open={walkOpen} onClose={() => setWalkOpen(false)} date={today} onSaved={load} />
    </div>
  );
}
