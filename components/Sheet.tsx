"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/** iOS-style bottom sheet (modal card on desktop). */
export default function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="animate-fade absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="animate-sheet relative w-full max-w-lg rounded-t-[22px] bg-bg shadow-sheet md:rounded-[22px]">
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <h2 className="text-[20px] font-bold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full bg-black/[0.06] p-1.5 text-secondary transition active:scale-95"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>
        <div className="max-h-[78dvh] overflow-y-auto px-5 pb-[max(20px,var(--safe-bottom))] pt-3">
          {children}
        </div>
      </div>
    </div>
  );
}
