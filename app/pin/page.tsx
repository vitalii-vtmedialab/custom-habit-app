"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function PinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || busy) return;
    setBusy(true);
    setError(false);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      router.replace("/");
      router.refresh();
    } else {
      setError(true);
      setPin("");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-blue/10">
        <Lock size={30} className="text-blue" strokeWidth={2.2} />
      </div>
      <h1 className="mb-1 text-[22px] font-bold">Enter PIN</h1>
      <p className="mb-6 text-[14px] text-secondary">This app is private.</p>
      <form onSubmit={submit} className="w-full max-w-[240px]">
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(false);
          }}
          className={`input text-center text-[24px] tracking-[8px] ${
            error ? "ring-2 ring-red/60" : ""
          }`}
          placeholder="••••"
          aria-label="PIN"
        />
        {error && (
          <p className="mt-2 text-center text-[13px] font-medium text-red">Wrong PIN</p>
        )}
        <button type="submit" disabled={!pin || busy} className="btn-primary mt-4 w-full">
          Unlock
        </button>
      </form>
    </div>
  );
}
