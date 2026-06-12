"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import BarChart from "@/components/BarChart";
import SegmentedControl from "@/components/SegmentedControl";
import { WalkSheet } from "@/components/LogSheets";
import { addDays, formatShort, rangeKeys, todayKey, weekStart } from "@/lib/dates";
import type { Profile, Session } from "@/lib/types";

type Period = "week" | "month";
type Metric = "steps" | "calories" | "distanceMi" | "durationMin";

const METRICS: { value: Metric; label: string; color: string; unit: string }[] = [
  { value: "steps", label: "Steps", color: "#32D74B", unit: "" },
  { value: "calories", label: "Cal", color: "#FF375F", unit: " cal" },
  { value: "distanceMi", label: "Miles", color: "#30B0C7", unit: " mi" },
  { value: "durationMin", label: "Time", color: "#FF9500", unit: " min" },
];

export default function ActivityPage() {
  const today = todayKey();
  const [period, setPeriod] = useState<Period>("week");
  const [metric, setMetric] = useState<Metric>("steps");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [walkOpen, setWalkOpen] = useState(false);

  const from = period === "week" ? weekStart(today) : addDays(today, -29);

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

  const daily = useMemo(() => {
    const map = new Map<string, number>();
    for (const k of rangeKeys(from, today)) map.set(k, 0);
    for (const s of sessions) {
      map.set(s.date, (map.get(s.date) ?? 0) + (s[metric] as number));
    }
    return [...map.entries()].map(([date, value]) => ({
      date,
      label:
        period === "week"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
              (new Date(date + "T12:00:00").getDay() + 6) % 7
            ]
          : formatShort(date),
      value: metric === "distanceMi" ? Math.round(value * 100) / 100 : Math.round(value),
    }));
  }, [sessions, from, today, metric, period]);

  const goal =
    metric === "steps" ? profile?.stepGoal : metric === "calories" ? profile?.calorieGoal : undefined;

  const total = daily.reduce((a, d) => a + d.value, 0);
  const activeDays = daily.filter((d) => d.value > 0).length;
  const avg = activeDays ? total / activeDays : 0;
  const daysMet = goal ? daily.filter((d) => d.value >= goal).length : null;

  const fmt = (v: number) =>
    metric === "distanceMi" ? (Math.round(v * 10) / 10).toLocaleString() : Math.round(v).toLocaleString();

  return (
    <div>
      <h1 className="large-title mb-5">Activity</h1>

      <div className="mb-3 flex flex-col gap-2">
        <SegmentedControl
          options={[
            { value: "week", label: "This Week" },
            { value: "month", label: "30 Days" },
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
        <BarChart data={daily} goal={goal ?? undefined} color={meta.color} formatValue={fmt} />
        <div className="mt-3 grid grid-cols-3 divide-x divide-sep/70 text-center">
          <div>
            <div className="text-[12px] font-medium text-secondary">Total</div>
            <div className="text-[17px] font-bold">{fmt(total)}{meta.unit}</div>
          </div>
          <div>
            <div className="text-[12px] font-medium text-secondary">Avg / active day</div>
            <div className="text-[17px] font-bold">{fmt(avg)}{meta.unit}</div>
          </div>
          <div>
            <div className="text-[12px] font-medium text-secondary">
              {daysMet != null ? "Goal met" : "Active days"}
            </div>
            <div className="text-[17px] font-bold">
              {daysMet != null ? `${daysMet} d` : `${activeDays} d`}
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
