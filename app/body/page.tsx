"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, Plus, Trash2, X } from "lucide-react";
import LineChart from "@/components/LineChart";
import SegmentedControl from "@/components/SegmentedControl";
import Sheet from "@/components/Sheet";
import { formatShort, todayKey } from "@/lib/dates";
import type { Weighin } from "@/lib/types";

type Series = "weightLb" | "bellyIn" | "chestIn" | "armIn" | "neckIn";

const SERIES: { value: Series; label: string; unit: string; color: string }[] = [
  { value: "weightLb", label: "Weight", unit: " lb", color: "#C17A47" },
  { value: "bellyIn", label: "Belly", unit: "″", color: "#D98E5A" },
  { value: "chestIn", label: "Chest", unit: "″", color: "#8A7BB5" },
  { value: "armIn", label: "Arm", unit: "″", color: "#5BA8A0" },
  { value: "neckIn", label: "Neck", unit: "″", color: "#C96F8A" },
];

export default function BodyPage() {
  const [entries, setEntries] = useState<Weighin[]>([]);
  const [series, setSeries] = useState<Series>("weightLb");
  const [addOpen, setAddOpen] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/weighins", { cache: "no-store" });
    if (res.ok) setEntries(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const meta = SERIES.find((s) => s.value === series)!;

  const points = useMemo(
    () =>
      [...entries]
        .reverse()
        .filter((e) => e[series] != null)
        .map((e) => ({ label: formatShort(e.date), value: e[series] as number })),
    [entries, series]
  );

  const latest = entries[0];
  const delta =
    entries.length >= 2 && entries[0].weightLb != null
      ? Math.round((entries[0].weightLb - entries[entries.length - 1].weightLb) * 10) / 10
      : null;

  return (
    <div>
      <h1 className="large-title mb-5">Body</h1>

      {latest && (
        <div className="mb-3 flex items-baseline gap-3">
          <span className="text-[40px] font-bold tracking-tight">{latest.weightLb}</span>
          <span className="text-[17px] font-medium text-secondary">lb</span>
          {delta != null && delta !== 0 && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[14px] font-semibold ${
                delta < 0 ? "bg-green/15 text-[#1F9D45]" : "bg-red/10 text-red"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {delta} lb total
            </span>
          )}
        </div>
      )}

      <div className="mb-3">
        <SegmentedControl
          options={SERIES.map((s) => ({ value: s.value, label: s.label }))}
          value={series}
          onChange={setSeries}
        />
      </div>

      <div className="card mb-3 p-4">
        <LineChart points={points} color={meta.color} unit={meta.unit} />
      </div>

      <button onClick={() => setAddOpen(true)} className="btn-primary mb-6 w-full">
        <Plus size={18} strokeWidth={2.6} /> Add Weigh-in
      </button>

      <div className="section-label">History</div>
      <div className="flex flex-col gap-3">
        {entries.length === 0 && (
          <div className="card p-8 text-center text-[14px] text-secondary">
            Log your first weigh-in — weekly is a good rhythm.
          </div>
        )}
        {entries.map((e, i) => {
          const prev = entries[i + 1];
          const d =
            prev != null ? Math.round((e.weightLb - prev.weightLb) * 10) / 10 : null;
          return (
            <div key={e.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold">{formatShort(e.date)}</div>
                  <div className="text-[20px] font-bold">
                    {e.weightLb} lb{" "}
                    {d != null && d !== 0 && (
                      <span
                        className={`text-[14px] font-semibold ${
                          d < 0 ? "text-[#1F9D45]" : "text-red"
                        }`}
                      >
                        {d > 0 ? "+" : ""}
                        {d}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm("Delete this weigh-in and its photos?")) return;
                    await fetch(`/api/weighins?id=${e.id}`, { method: "DELETE" });
                    load();
                  }}
                  className="rounded-full p-2 text-tertiary transition hover:text-red active:scale-90"
                  aria-label="Delete weigh-in"
                >
                  <Trash2 size={17} />
                </button>
              </div>
              {(e.bellyIn || e.chestIn || e.armIn || e.neckIn) && (
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-secondary">
                  {e.bellyIn && <span>Belly {e.bellyIn}″</span>}
                  {e.chestIn && <span>Chest {e.chestIn}″</span>}
                  {e.armIn && <span>Arm {e.armIn}″</span>}
                  {e.neckIn && <span>Neck {e.neckIn}″</span>}
                </div>
              )}
              {e.note && <p className="mt-1 text-[13px] text-secondary">{e.note}</p>}
              {e.photoIds.length > 0 && (
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                  {e.photoIds.map((pid) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={pid}
                      src={`/api/photos/${pid}`}
                      alt="Progress"
                      onClick={() => setViewPhoto(pid)}
                      className="h-24 w-20 shrink-0 cursor-pointer rounded-[10px] object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddWeighinSheet open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />

      {viewPhoto != null && (
        <div
          className="animate-fade fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setViewPhoto(null)}
        >
          <button
            className="absolute right-5 top-[max(20px,var(--safe-top))] rounded-full bg-white/15 p-2 text-white"
            aria-label="Close photo"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/photos/${viewPhoto}`}
            alt="Progress full size"
            className="max-h-full max-w-full rounded-[14px] object-contain"
          />
        </div>
      )}
    </div>
  );
}

function AddWeighinSheet({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(todayKey());
  const [weight, setWeight] = useState("");
  const [belly, setBelly] = useState("");
  const [chest, setChest] = useState("");
  const [arm, setArm] = useState("");
  const [neck, setNeck] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const res = await fetch("/api/weighins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        weightLb: Number(weight),
        bellyIn: belly,
        chestIn: chest,
        armIn: arm,
        neckIn: neck,
        note,
      }),
    });
    if (res.ok) {
      const entry = await res.json();
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("weighinId", String(entry.id));
        await fetch("/api/photos", { method: "POST", body: fd });
      }
      setWeight("");
      setBelly("");
      setChest("");
      setArm("");
      setNeck("");
      setNote("");
      setFiles([]);
      onClose();
      onSaved();
    }
    setBusy(false);
  };

  const measure = (
    label: string,
    val: string,
    set: (v: string) => void
  ) => (
    <div className="flex-1">
      <label className="section-label mb-1.5 block px-0">{label} (in)</label>
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        value={val}
        onChange={(e) => set(e.target.value)}
        className="input"
        placeholder="—"
      />
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} title="Add Weigh-in">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="section-label mb-1.5 block px-0">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex-1">
            <label className="section-label mb-1.5 block px-0">Weight (lb)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input"
              placeholder="185.0"
            />
          </div>
        </div>
        <div className="flex gap-3">
          {measure("Belly", belly, setBelly)}
          {measure("Chest", chest, setChest)}
        </div>
        <div className="flex gap-3">
          {measure("Arm", arm, setArm)}
          {measure("Neck", neck, setNeck)}
        </div>
        <div>
          <label className="section-label mb-1.5 block px-0">Note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="section-label mb-1.5 block px-0">Photos</label>
          <label className="btn-gray w-full cursor-pointer">
            <Camera size={18} />
            {files.length ? `${files.length} photo${files.length > 1 ? "s" : ""} selected` : "Attach photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles([...(e.target.files ?? [])])}
            />
          </label>
        </div>
        <button
          onClick={save}
          disabled={busy || !Number(weight)}
          className="btn-primary w-full"
        >
          {busy ? "Saving…" : "Save Weigh-in"}
        </button>
      </div>
    </Sheet>
  );
}
