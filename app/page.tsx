"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Flame, Lock, Minus, Plus } from "lucide-react";
import ActivityRings from "@/components/ActivityRings";
import HabitIcon from "@/components/HabitIcon";
import { LiftSheet, WalkSheet } from "@/components/LogSheets";
import { formatLong, todayKey } from "@/lib/dates";
import type { TodayData } from "@/lib/types";

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [walkOpen, setWalkOpen] = useState(false);
  const [liftOpen, setLiftOpen] = useState(false);
  const today = todayKey();

  const load = useCallback(async () => {
    const res = await fetch(`/api/today?date=${today}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const logHabit = async (habitId: number, delta: number) => {
    if (!data) return;
    // optimistic
    setData({
      ...data,
      habits: data.habits.map((h) =>
        h.id === habitId
          ? { ...h, todayCount: Math.max(0, Math.min(h.targetPerDay, h.todayCount + delta)) }
          : h
      ),
    });
    await fetch(`/api/habits/${habitId}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, delta }),
    });
    load();
  };

  if (!data) {
    return (
      <div className="animate-pulse">
        <div className="mb-2 h-4 w-40 rounded bg-black/10" />
        <div className="mb-6 h-9 w-24 rounded bg-black/10" />
        <div className="card h-64" />
      </div>
    );
  }

  const { profile: prof, habits, strength } = data;
  const stepGoalMet = data.steps >= prof.stepGoal;

  return (
    <div>
      <p className="text-[14px] font-medium uppercase tracking-wide text-secondary">
        {formatLong(today)}
      </p>
      <h1 className="large-title mb-5 mt-0.5">Today</h1>

      {/* Rings */}
      <div className="card mb-3 p-5">
        <div className="flex items-center gap-5">
          <ActivityRings
            steps={data.steps}
            stepGoal={prof.stepGoal}
            calories={data.calories}
            calorieGoal={prof.calorieGoal}
            size={170}
          />
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-[13px] font-medium text-secondary">Steps</div>
              <div className="text-[22px] font-bold leading-tight text-[#24A148]">
                {data.steps.toLocaleString()}
                <span className="text-[14px] font-semibold text-tertiary">
                  {" "}/ {prof.stepGoal.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-secondary">Calories</div>
              <div className="text-[22px] font-bold leading-tight text-ringMove">
                {data.calories}
                <span className="text-[14px] font-semibold text-tertiary">
                  {" "}/ {prof.calorieGoal}
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-[13px] font-medium text-secondary">
              <span>{data.distanceMi} mi</span>
              <span>{data.walkMin} min</span>
            </div>
          </div>
        </div>
        <button onClick={() => setWalkOpen(true)} className="btn-primary mt-4 w-full">
          <Plus size={18} strokeWidth={2.6} /> Add Walk
        </button>
      </div>

      {/* Check-ins */}
      <div className="section-label mt-6">Check-ins</div>
      <div className="card">
        {/* Step goal — auto, locked until met */}
        <div className="row">
          <HabitIcon icon="footprints" color="#34C759" />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-medium">Hit step goal</div>
            <div className="flex items-center gap-1 text-[13px] text-secondary">
              {data.stepStreak > 0 && (
                <>
                  <Flame size={13} className="text-orange" />
                  <span>{data.stepStreak} day streak</span>
                  <span className="px-1">·</span>
                </>
              )}
              <span>auto when goal reached</span>
            </div>
          </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              stepGoalMet ? "bg-green" : "bg-black/[0.07]"
            }`}
            title={stepGoalMet ? "Done" : "Locked until step goal met"}
          >
            {stepGoalMet ? (
              <Check size={18} className="text-white" strokeWidth={3} />
            ) : (
              <Lock size={14} className="text-tertiary" strokeWidth={2.4} />
            )}
          </div>
        </div>

        {/* Strength */}
        <div className="row">
          <HabitIcon icon="dumbbell" color="#5856D6" />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-medium">Strength training</div>
            <div className="text-[13px] text-secondary">
              {strength.doneThisWeek} of {strength.target} this week
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.max(strength.target, 1) }, (_, i) => (
              <div
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${
                  i < strength.doneThisWeek ? "bg-indigo" : "bg-black/[0.1]"
                }`}
              />
            ))}
            <button
              onClick={() => setLiftOpen(true)}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo/10 text-indigo transition active:scale-90"
              aria-label="Log strength session"
            >
              <Plus size={18} strokeWidth={2.6} />
            </button>
          </div>
        </div>

        {/* User habits */}
        {habits.map((h) => {
          const done = h.todayCount >= h.targetPerDay;
          return (
            <div key={h.id} className="row">
              <HabitIcon icon={h.icon} color={h.color} />
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-medium">{h.name}</div>
                <div className="flex items-center gap-1 text-[13px] text-secondary">
                  {h.streak > 0 && (
                    <>
                      <Flame size={13} className="text-orange" />
                      <span>{h.streak} day streak</span>
                    </>
                  )}
                  {h.streak > 0 && h.type === "quantity" && <span className="px-1">·</span>}
                  {h.type === "quantity" && (
                    <span>
                      {h.todayCount} of {h.targetPerDay}
                    </span>
                  )}
                </div>
              </div>
              {h.type === "quantity" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => logHabit(h.id, -1)}
                    disabled={h.todayCount === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-secondary transition active:scale-90 disabled:opacity-30"
                    aria-label="Decrease"
                  >
                    <Minus size={16} strokeWidth={2.6} />
                  </button>
                  <span
                    className="w-6 text-center text-[16px] font-bold"
                    style={{ color: done ? h.color : undefined }}
                  >
                    {h.todayCount}
                  </span>
                  <button
                    onClick={() => logHabit(h.id, 1)}
                    disabled={done}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-40"
                    style={{ backgroundColor: `${h.color}1F`, color: h.color }}
                    aria-label="Increase"
                  >
                    <Plus size={16} strokeWidth={2.6} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => logHabit(h.id, done ? -1 : 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90"
                  style={{ backgroundColor: done ? h.color : "rgba(0,0,0,0.07)" }}
                  aria-label={done ? "Mark not done" : "Mark done"}
                >
                  {done && <Check size={18} className="text-white" strokeWidth={3} />}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <WalkSheet open={walkOpen} onClose={() => setWalkOpen(false)} date={today} onSaved={load} />
      <LiftSheet open={liftOpen} onClose={() => setLiftOpen(false)} date={today} onSaved={load} />
    </div>
  );
}
