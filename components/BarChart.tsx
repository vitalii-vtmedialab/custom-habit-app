"use client";

/** Minimal Apple-Health-style bar chart with goal line. */
export default function BarChart({
  data,
  goal,
  color = "#32D74B",
  height = 160,
  formatValue = (v: number) => v.toLocaleString(),
}: {
  data: { label: string; value: number }[];
  goal?: number;
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}) {
  const W = 600;
  const H = height;
  const padTop = 18;
  const padBottom = 22;
  const max = Math.max(goal ?? 0, ...data.map((d) => d.value), 1) * 1.08;
  const innerH = H - padTop - padBottom;
  const n = data.length;
  const slot = W / Math.max(n, 1);
  const barW = Math.min(slot * 0.55, 34);
  const labelEvery = n > 14 ? Math.ceil(n / 8) : 1;

  const y = (v: number) => padTop + innerH * (1 - v / max);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      {goal != null && goal > 0 && (
        <>
          <line
            x1={0}
            x2={W}
            y1={y(goal)}
            y2={y(goal)}
            stroke="#C7C7CC"
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
          <text x={W - 4} y={y(goal) - 5} textAnchor="end" fontSize={11} fill="#8E8E93">
            goal {formatValue(goal)}
          </text>
        </>
      )}
      {data.map((d, i) => {
        const x = i * slot + (slot - barW) / 2;
        const h = Math.max(d.value > 0 ? 3 : 0, innerH * (d.value / max));
        const met = goal != null && goal > 0 && d.value >= goal;
        return (
          <g key={i}>
            <rect
              x={x}
              y={padTop + innerH - h}
              width={barW}
              height={h}
              rx={Math.min(6, barW / 2.5)}
              fill={color}
              opacity={goal != null && goal > 0 ? (met ? 1 : 0.45) : 0.9}
            />
            {i % labelEvery === 0 && (
              <text
                x={i * slot + slot / 2}
                y={H - 6}
                textAnchor="middle"
                fontSize={11}
                fill="#8E8E93"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
