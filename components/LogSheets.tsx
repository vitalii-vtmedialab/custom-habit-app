"use client";

import { useState } from "react";
import { Dumbbell, Footprints } from "lucide-react";
import Sheet from "@/components/Sheet";
import SegmentedControl from "@/components/SegmentedControl";

export function WalkSheet({
  open,
  onClose,
  date,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  onSaved: () => void;
}) {
  const [duration, setDuration] = useState("");
  const [speed, setSpeed] = useState("2.5");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, durationMin: Number(duration), speedMph: Number(speed) }),
    });
    setBusy(false);
    if (res.ok) {
      setDuration("");
      onClose();
      onSaved();
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add Walk">
      <div className="flex flex-col gap-4">
        <div>
          <label className="section-label mb-1.5 block px-0">Duration (minutes)</label>
          <input
            type="number"
            inputMode="decimal"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input"
            placeholder="45"
            autoFocus
          />
        </div>
        <div>
          <label className="section-label mb-1.5 block px-0">Speed (mph)</label>
          <div className="mb-2 flex gap-2">
            {["2.0", "2.5", "3.0", "3.5"].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`flex-1 rounded-ios py-2 text-[14px] font-semibold transition ${
                  speed === s ? "bg-blue text-white" : "bg-[#EFEFF0] text-label"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            className="input"
            placeholder="2.5"
          />
        </div>
        <p className="text-[13px] leading-snug text-secondary">
          Steps, distance and calories are calculated from your height, weight and gender in
          Settings.
        </p>
        <button
          onClick={save}
          disabled={busy || !Number(duration) || !Number(speed)}
          className="btn-primary w-full"
        >
          <Footprints size={18} /> Save Walk
        </button>
      </div>
    </Sheet>
  );
}

export function LiftSheet({
  open,
  onClose,
  date,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  onSaved: () => void;
}) {
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState<"home" | "gym">("home");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const res = await fetch("/api/strength", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, durationMin: Number(duration), location }),
    });
    setBusy(false);
    if (res.ok) {
      setDuration("");
      onClose();
      onSaved();
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Log Strength Session">
      <div className="flex flex-col gap-4">
        <div>
          <label className="section-label mb-1.5 block px-0">Duration (minutes)</label>
          <input
            type="number"
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input"
            placeholder="40"
            autoFocus
          />
        </div>
        <div>
          <label className="section-label mb-1.5 block px-0">Where</label>
          <SegmentedControl
            options={[
              { value: "home", label: "Home" },
              { value: "gym", label: "Gym" },
            ]}
            value={location}
            onChange={setLocation}
          />
        </div>
        <button
          onClick={save}
          disabled={busy || !Number(duration)}
          className="btn-primary w-full"
        >
          <Dumbbell size={18} /> Save Session
        </button>
      </div>
    </Sheet>
  );
}
