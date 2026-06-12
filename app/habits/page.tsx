"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, ChevronRight, Flame, Minus, Plus, Trash2 } from "lucide-react";
import HabitIcon, { HABIT_COLORS, HABIT_ICONS } from "@/components/HabitIcon";
import MonthCalendar from "@/components/MonthCalendar";
import Sheet from "@/components/Sheet";
import SegmentedControl from "@/components/SegmentedControl";
import { addDays, monthStart, todayKey, weekStart } from "@/lib/dates";
import type { HabitWithToday, Session, StrengthSession, TodayData } from "@/lib/types";

export default function HabitsPage() {
  const today = todayKey();
  const [data, setData] = useState<TodayData | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<HabitWithToday | null>(null);
  const [builtin, setBuiltin] = useState<"steps" | "strength" | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/today?date=${today}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return (
      <div className="animate-pulse">
        <div className="mb-6 h-9 w-32 rounded bg-black/10" />
        <div className="card h-72" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="large-title mb-5">Habits</h1>

      <div className="section-label">Built-in</div>
      <div className="card mb-6">
        <button className="row w-full text-left" onClick={() => setBuiltin("steps")}>
          <HabitIcon icon="footprints" color="#7FAE74" />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-medium">Hit step goal</div>
            <div className="flex items-center gap-1 text-[13px] text-secondary">
              <Flame size={13} className="text-orange" />
              {data.stepStreak} day streak
            </div>
          </div>
          <ChevronRight size={18} className="text-tertiary" />
        </button>
        <button className="row w-full text-left" onClick={() => setBuiltin("strength")}>
          <HabitIcon icon="dumbbell" color="#5856D6" />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-medium">Strength training</div>
            <div className="text-[13px] text-secondary">
              {data.strength.doneThisWeek} of {data.strength.target} this week
            </div>
          </div>
          <ChevronRight size={18} className="text-tertiary" />
        </button>
      </div>

      <div className="section-label">Your habits</div>
      <div className="card mb-4">
        {data.habits.length === 0 && (
          <div className="row justify-center py-8 text-[14px] text-secondary">
            No habits yet — add one below
          </div>
        )}
        {data.habits.map((h) => (
          <button key={h.id} className="row w-full text-left" onClick={() => setDetail(h)}>
            <HabitIcon icon={h.icon} color={h.color} />
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-medium">{h.name}</div>
              <div className="flex items-center gap-1 text-[13px] text-secondary">
                <Flame size={13} className="text-orange" />
                <span>{h.streak} day streak</span>
                {h.type === "quantity" && (
                  <span className="pl-1">· {h.targetPerDay}× daily</span>
                )}
                {h.endDate && <span className="pl-1">· until {h.endDate}</span>}
              </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </button>
        ))}
      </div>

      <button onClick={() => setAddOpen(true)} className="btn-primary w-full">
        <Plus size={18} strokeWidth={2.6} /> New Habit
      </button>

      <AddHabitSheet open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />
      {detail && (
        <HabitDetailSheet habit={detail} onClose={() => setDetail(null)} onChanged={load} />
      )}
      {builtin === "steps" && (
        <StepsDetailSheet stepGoal={data.profile.stepGoal} onClose={() => setBuiltin(null)} />
      )}
      {builtin === "strength" && (
        <StrengthDetailSheet
          target={data.strength.target}
          done={data.strength.doneThisWeek}
          onClose={() => setBuiltin(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

/* ---------- Add habit ---------- */

function AddHabitSheet({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"check" | "quantity">("check");
  const [target, setTarget] = useState(3);
  const [icon, setIcon] = useState("circle-check");
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [weeks, setWeeks] = useState<string>(""); // optional course length
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const endDate = Number(weeks)
      ? addDays(todayKey(), Number(weeks) * 7 - 1)
      : undefined;
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        targetPerDay: type === "quantity" ? target : 1,
        icon,
        color,
        endDate,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setName("");
      setType("check");
      setTarget(3);
      setWeeks("");
      onClose();
      onSaved();
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="New Habit">
      <div className="flex flex-col gap-4">
        <div>
          <label className="section-label mb-1.5 block px-0">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="e.g. Gut cleanse pills"
            autoFocus
          />
        </div>
        <div>
          <label className="section-label mb-1.5 block px-0">Type</label>
          <SegmentedControl
            options={[
              { value: "check", label: "Once a day" },
              { value: "quantity", label: "Several times a day" },
            ]}
            value={type}
            onChange={setType}
          />
        </div>
        {type === "quantity" && (
          <div className="flex items-center justify-between rounded-ios bg-[#EFEFF0] px-4 py-3">
            <span className="text-[16px] font-medium">Times per day</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTarget(Math.max(1, target - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-card active:scale-90"
                aria-label="Decrease"
              >
                <Minus size={16} />
              </button>
              <span className="w-5 text-center text-[17px] font-bold">{target}</span>
              <button
                onClick={() => setTarget(Math.min(50, target + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-card active:scale-90"
                aria-label="Increase"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
        <div>
          <label className="section-label mb-1.5 block px-0">
            Course length (weeks, optional)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
            className="input"
            placeholder="e.g. 4 — habit ends automatically"
          />
        </div>
        <div>
          <label className="section-label mb-1.5 block px-0">Icon</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(HABIT_ICONS).map((key) => (
              <button
                key={key}
                onClick={() => setIcon(key)}
                className={`rounded-full transition ${
                  icon === key ? "ring-2 ring-blue ring-offset-2" : ""
                }`}
                aria-label={key}
              >
                <HabitIcon icon={key} color={color} size={40} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="section-label mb-1.5 block px-0">Color</label>
          <div className="flex flex-wrap gap-2.5">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-9 w-9 rounded-full transition ${
                  color === c ? "ring-2 ring-offset-2" : ""
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <button onClick={save} disabled={busy || !name.trim()} className="btn-primary w-full">
          Create Habit
        </button>
      </div>
    </Sheet>
  );
}

/* ---------- User habit detail ---------- */

function HabitDetailSheet({
  habit,
  onClose,
  onChanged,
}: {
  habit: HabitWithToday;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [logs, setLogs] = useState<Map<string, number>>(new Map());
  const [month, setMonth] = useState(monthStart(todayKey()));

  useEffect(() => {
    const to = addDays(month, 40);
    fetch(`/api/habits/${habit.id}?from=${month}&to=${to}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        const m = new Map<string, number>();
        for (const log of d.logs) m.set(log.date, log.count);
        setLogs(m);
      });
  }, [habit.id, month]);

  const status = (key: string): "done" | "partial" | "missed" | "off" => {
    if (key < habit.startDate || (habit.endDate && key > habit.endDate)) return "off";
    const c = logs.get(key) ?? 0;
    if (c >= habit.targetPerDay) return "done";
    if (c > 0) return "partial";
    return "missed";
  };

  const archive = async () => {
    await fetch(`/api/habits/${habit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: true }),
    });
    onClose();
    onChanged();
  };

  const remove = async () => {
    if (!confirm(`Delete "${habit.name}" and all its history?`)) return;
    await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
    onClose();
    onChanged();
  };

  return (
    <Sheet open onClose={onClose} title={habit.name}>
      <div className="mb-4 flex items-center gap-2 text-[14px] text-secondary">
        <Flame size={15} className="text-orange" />
        <span className="font-semibold text-label">{habit.streak} day streak</span>
        {habit.type === "quantity" && <span>· {habit.targetPerDay}× per day</span>}
        {habit.endDate && <span>· ends {habit.endDate}</span>}
      </div>
      <div className="card p-4">
        <MonthCalendar status={status} color={habit.color} onMonthChange={setMonth} />
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={archive} className="btn-gray flex-1">
          <Archive size={17} /> Archive
        </button>
        <button onClick={remove} className="btn flex-1 bg-red/10 px-5 py-3 text-[16px] text-red">
          <Trash2 size={17} /> Delete
        </button>
      </div>
    </Sheet>
  );
}

/* ---------- Built-in: steps ---------- */

function StepsDetailSheet({ stepGoal, onClose }: { stepGoal: number; onClose: () => void }) {
  const [daily, setDaily] = useState<Map<string, number>>(new Map());
  const [month, setMonth] = useState(monthStart(todayKey()));

  useEffect(() => {
    const to = addDays(month, 40);
    fetch(`/api/sessions?from=${month}&to=${to}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Session[]) => {
        const m = new Map<string, number>();
        for (const s of rows) m.set(s.date, (m.get(s.date) ?? 0) + s.steps);
        setDaily(m);
      });
  }, [month]);

  const status = (key: string): "done" | "partial" | "missed" | "off" => {
    const v = daily.get(key) ?? 0;
    if (v >= stepGoal) return "done";
    if (v > 0) return "partial";
    return "missed";
  };

  return (
    <Sheet open onClose={onClose} title="Hit step goal">
      <p className="mb-4 text-[14px] text-secondary">
        Checked automatically when treadmill steps reach {stepGoal.toLocaleString()}. Change the
        goal in Settings.
      </p>
      <div className="card p-4">
        <MonthCalendar status={status} color="#7FAE74" onMonthChange={setMonth} />
      </div>
    </Sheet>
  );
}

/* ---------- Built-in: strength ---------- */

function StrengthDetailSheet({
  target,
  done,
  onClose,
  onChanged,
}: {
  target: number;
  done: number;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [days, setDays] = useState<Map<string, StrengthSession[]>>(new Map());
  const [month, setMonth] = useState(monthStart(todayKey()));
  const [goal, setGoal] = useState(target);

  useEffect(() => {
    const from = addDays(weekStart(month), -7);
    const to = addDays(month, 45);
    fetch(`/api/strength?from=${from}&to=${to}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: StrengthSession[]) => {
        const m = new Map<string, StrengthSession[]>();
        for (const s of rows) {
          if (!m.has(s.date)) m.set(s.date, []);
          m.get(s.date)!.push(s);
        }
        setDays(m);
      });
  }, [month]);

  const status = (key: string): "done" | "partial" | "missed" | "off" =>
    days.has(key) ? "done" : "missed";

  const updateGoal = async (next: number) => {
    const clamped = Math.max(1, Math.min(14, next));
    setGoal(clamped);
    await fetch("/api/strength/goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: clamped }),
    });
    onChanged();
  };

  return (
    <Sheet open onClose={onClose} title="Strength training">
      <div className="mb-4 flex items-center justify-between rounded-ios bg-[#EFEFF0] px-4 py-3">
        <div>
          <div className="text-[16px] font-medium">Weekly goal</div>
          <div className="text-[13px] text-secondary">
            {done} done this week · changes apply from this week on
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateGoal(goal - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-card active:scale-90"
            aria-label="Decrease goal"
          >
            <Minus size={16} />
          </button>
          <span className="w-5 text-center text-[17px] font-bold">{goal}</span>
          <button
            onClick={() => updateGoal(goal + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-card active:scale-90"
            aria-label="Increase goal"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="card p-4">
        <MonthCalendar status={status} color="#5856D6" onMonthChange={setMonth} />
      </div>
      <p className="mt-3 text-[13px] text-secondary">
        Days with at least one strength session are highlighted.
      </p>
    </Sheet>
  );
}
