"use client";

/** Smooth line chart for weight/measurement trends. */
export default function LineChart({
  points,
  color = "#C17A47",
  height = 180,
  unit = "",
}: {
  points: { label: string; value: number }[];
  color?: string;
  height?: number;
  unit?: string;
}) {
  const W = 600;
  const H = height;
  const padTop = 16;
  const padBottom = 24;
  const padX = 26;

  if (points.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-[14px] text-secondary">
        No data yet
      </div>
    );
  }

  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = Math.max(max - min, 1);
  const lo = min - span * 0.15;
  const hi = max + span * 0.15;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const x = (i: number) =>
    padX + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => padTop + innerH * (1 - (v - lo) / (hi - lo));

  // Catmull-Rom → bezier for a smooth Apple-Health-style curve
  const path = points
    .map((p, i) => {
      if (i === 0) return `M ${x(0)} ${y(p.value)}`;
      const p0 = points[Math.max(0, i - 2)];
      const p1 = points[i - 1];
      const p2 = points[i];
      const p3 = points[Math.min(points.length - 1, i + 1)];
      const c1x = x(i - 1) + (x(i) - x(Math.max(0, i - 2))) / 6;
      const c1y = y(p1.value) + (y(p2.value) - y(p0.value)) / 6;
      const c2x = x(i) - (x(Math.min(points.length - 1, i + 1)) - x(i - 1)) / 6;
      const c2y = y(p2.value) - (y(p3.value) - y(p1.value)) / 6;
      return `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x(i)} ${y(p2.value)}`;
    })
    .join(" ");

  const labelEvery = Math.max(1, Math.ceil(points.length / 6));
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${x(points.length - 1)} ${H - padBottom} L ${x(0)} ${H - padBottom} Z`}
        fill="url(#lc-fill)"
      />
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 5 : 3} fill="#fff" stroke={color} strokeWidth={2} />
          {i % labelEvery === 0 && (
            <text x={x(i)} y={H - 6} textAnchor="middle" fontSize={11} fill="#8E8E93">
              {p.label}
            </text>
          )}
        </g>
      ))}
      <text
        x={x(points.length - 1)}
        y={y(last.value) - 12}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill={color}
      >
        {last.value}
        {unit}
      </text>
    </svg>
  );
}
