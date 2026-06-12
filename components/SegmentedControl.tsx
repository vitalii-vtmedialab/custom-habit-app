"use client";

/** iOS-style segmented control. */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-[10px] bg-[#EEEEEF] p-[2px]">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-[8px] px-3 py-1.5 text-[13px] font-semibold transition ${
            value === o.value
              ? "bg-white text-label shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
              : "text-secondary"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
