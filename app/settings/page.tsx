"use client";

import { useEffect, useState } from "react";
import SegmentedControl from "@/components/SegmentedControl";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    heightFt: "5",
    heightIn: "10",
    birthYear: "1990",
    gender: "male" as "male" | "female",
    stepGoal: "10000",
    calorieGoal: "400",
    fallbackWeightLb: "180",
  });

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p: Profile | null) => {
        if (!p) return;
        setProfile(p);
        setForm({
          heightFt: String(Math.floor(p.heightIn / 12)),
          heightIn: String(Math.round(p.heightIn % 12)),
          birthYear: String(p.birthYear),
          gender: p.gender as "male" | "female",
          stepGoal: String(p.stepGoal),
          calorieGoal: String(p.calorieGoal),
          fallbackWeightLb: String(p.fallbackWeightLb),
        });
      });
  }, []);

  const save = async () => {
    const heightIn = Number(form.heightFt) * 12 + Number(form.heightIn);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heightIn,
        birthYear: Number(form.birthYear),
        gender: form.gender,
        stepGoal: Number(form.stepGoal),
        calorieGoal: Number(form.calorieGoal),
        fallbackWeightLb: Number(form.fallbackWeightLb),
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    placeholder = "",
    suffix = ""
  ) => (
    <div className="row justify-between">
      <span className="text-[16px]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-24 rounded-[10px] bg-[#EFEFF0] px-3 py-1.5 text-right text-[16px] outline-none focus:ring-2 focus:ring-blue/40"
          placeholder={placeholder}
        />
        {suffix && <span className="w-8 text-[14px] text-secondary">{suffix}</span>}
      </div>
    </div>
  );

  if (!profile) {
    return (
      <div className="animate-pulse">
        <div className="mb-6 h-9 w-36 rounded bg-black/10" />
        <div className="card h-72" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="large-title mb-5">Settings</h1>

      <div className="section-label">Profile — used for calorie & step math</div>
      <div className="card mb-6">
        <div className="row justify-between">
          <span className="text-[16px]">Height</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={form.heightFt}
              onChange={(e) => setForm({ ...form, heightFt: e.target.value })}
              className="w-16 rounded-[10px] bg-[#EFEFF0] px-3 py-1.5 text-right text-[16px] outline-none focus:ring-2 focus:ring-blue/40"
            />
            <span className="text-[14px] text-secondary">ft</span>
            <input
              type="number"
              inputMode="numeric"
              value={form.heightIn}
              onChange={(e) => setForm({ ...form, heightIn: e.target.value })}
              className="w-16 rounded-[10px] bg-[#EFEFF0] px-3 py-1.5 text-right text-[16px] outline-none focus:ring-2 focus:ring-blue/40"
            />
            <span className="text-[14px] text-secondary">in</span>
          </div>
        </div>
        {field("Birth year", "birthYear", "1990")}
        <div className="row justify-between">
          <span className="text-[16px]">Gender</span>
          <div className="w-44">
            <SegmentedControl
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
              value={form.gender}
              onChange={(g) => setForm({ ...form, gender: g })}
            />
          </div>
        </div>
        {field("Starting weight", "fallbackWeightLb", "180", "lb")}
      </div>

      <div className="section-label">Daily treadmill goals</div>
      <div className="card mb-6">
        {field("Step goal", "stepGoal", "10000")}
        {field("Calorie goal", "calorieGoal", "400", "cal")}
      </div>

      <button onClick={save} className="btn-primary w-full">
        {saved ? "Saved ✓" : "Save Changes"}
      </button>

      <p className="mt-6 text-center text-[12px] leading-relaxed text-secondary">
        Weight used in calculations always comes from your latest weigh-in on the Body page.
        <br />
        Starting weight is only used before your first weigh-in.
      </p>
    </div>
  );
}
