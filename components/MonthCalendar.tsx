"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fromKey, toKey, todayKey } from "@/lib/dates";

/**
 * Month grid showing habit completion.
 * status(date) => 'done' | 'partial' | 'missed' | 'off' (outside habit range / future)
 */
export default function MonthCalendar({
  status,
  color = "#34C759",
  onMonthChange,
}: {
  status: (dateKey: string) => "done" | "partial" | "missed" | "off";
  color?: string;
  onMonthChange?: (firstOfMonth: string) => void;
}) {
  const today = todayKey();
  const [anchor, setAnchor] = useState(() => today.slice(0, 7)); // YYYY-MM

  const [yy, mm] = anchor.split("-").map(Number);
  const first = new Date(yy, mm - 1, 1);
  const daysInMonth = new Date(yy, mm, 0).getDate();
  const startDow = (first.getDay() + 6) % 7; // Mon=0

  const cells: (string | null)[] = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toKey(new Date(yy, mm - 1, i + 1))),
  ];

  const move = (delta: number) => {
    const d = new Date(yy, mm - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    setAnchor(next);
    onMonthChange?.(`${next}-01`);
  };

  const monthLabel = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => move(-1)} className="rounded-full p-1.5 text-blue active:bg-blue/10" aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <div className="text-[15px] font-semibold">{monthLabel}</div>
        <button onClick={() => move(1)} className="rounded-full p-1.5 text-blue active:bg-blue/10" aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-[11px] font-medium text-secondary">
            {d}
          </div>
        ))}
        {cells.map((key, i) => {
          if (!key) return <div key={`e${i}`} />;
          const st = key > today ? "off" : status(key);
          const day = fromKey(key).getDate();
          const isToday = key === today;
          return (
            <div key={key} className="flex justify-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium ${
                  isToday ? "ring-2 ring-blue/60" : ""
                }`}
                style={
                  st === "done"
                    ? { backgroundColor: color, color: "#fff" }
                    : st === "partial"
                    ? { backgroundColor: `${color}33`, color: "#000" }
                    : st === "missed"
                    ? { color: "#C7C7CC" }
                    : { color: "#D9D9DE" }
                }
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
