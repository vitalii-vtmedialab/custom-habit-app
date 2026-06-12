"use client";

import { useState } from "react";

export interface BarDatum {
  label: string;
  value: number;
  /** Richer label shown in the tooltip (e.g. full date). Falls back to `label`. */
  tip?: string;
}

/** "Nice" axis ticks: rounded steps (1/2/2.5/5 × 10ⁿ) covering [0, max]. */
function niceTicks(max: number, target = 4): { ticks: number[]; niceMax: number } {
  if (max <= 0) return { ticks: [0], niceMax: 1 };
  const rawStep = max / target;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= niceMax + step * 1e-6; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return { ticks, niceMax };
}

const compact = (v: number) =>
  v >= 1000 ? String(Math.round(v / 100) / 10).replace(/\.0$/, "") + "k" : String(Math.round(v));

/** Apple-Health-style bar chart with value gridlines, goal line and tap/hover tooltip. */
export default function BarChart({
  data,
  goal,
  color = "#7FAE74",
  height = 184,
  formatValue = (v: number) => v.toLocaleString(),
}: {
  data: BarDatum[];
  goal?: number;
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const W = 600;
  const H = height;
  const padTop = 20;
  const padBottom = 22;
  const padLeft = 40;
  const padRight = 10;
  const innerW = W - padLeft - padRight;
  const innerH = H - padTop - padBottom;

  const rawMax = Math.max(goal ?? 0, ...data.map((d) => d.value), 1);
  const { ticks, niceMax: max } = niceTicks(rawMax);

  const n = data.length;
  const slot = innerW / Math.max(n, 1);
  const barW = Math.min(slot * 0.55, 30);
  const labelEvery = n > 14 ? Math.ceil(n / 10) : 1;

  const y = (v: number) => padTop + innerH * (1 - v / max);
  const barX = (i: number) => padLeft + i * slot + (slot - barW) / 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full touch-none select-none"
      role="img"
      onPointerLeave={() => setActive(null)}
    >
      {/* horizontal gridlines + axis labels */}
      {ticks.map((t, i) => (
        <g key={`g${i}`}>
          <line
            x1={padLeft}
            x2={W - padRight}
            y1={y(t)}
            y2={y(t)}
            stroke="#E8E2D6"
            strokeWidth={1}
          />
          <text x={padLeft - 6} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill="#A89B86">
            {compact(t)}
          </text>
        </g>
      ))}

      {/* goal line */}
      {goal != null && goal > 0 && (
        <>
          <line
            x1={padLeft}
            x2={W - padRight}
            y1={y(goal)}
            y2={y(goal)}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            opacity={0.8}
          />
          <text x={W - padRight} y={y(goal) - 5} textAnchor="end" fontSize={10.5} fill={color}>
            goal {formatValue(goal)}
          </text>
        </>
      )}

      {/* bars + hit targets */}
      {data.map((d, i) => {
        const h = Math.max(d.value > 0 ? 3 : 0, innerH * (d.value / max));
        const met = goal != null && goal > 0 && d.value >= goal;
        const isActive = active === i;
        const baseOpacity = goal != null && goal > 0 ? (met ? 1 : 0.5) : 0.9;
        return (
          <g key={i}>
            {/* full-height invisible hit target */}
            <rect
              x={padLeft + i * slot}
              y={padTop}
              width={slot}
              height={innerH + padBottom}
              fill="transparent"
              onPointerEnter={() => setActive(i)}
              onPointerDown={() => setActive(i)}
            />
            <rect
              x={barX(i)}
              y={padTop + innerH - h}
              width={barW}
              height={h}
              rx={Math.min(6, barW / 2.5)}
              fill={color}
              opacity={isActive ? 1 : baseOpacity}
              style={{ pointerEvents: "none" }}
            />
            {i % labelEvery === 0 && (
              <text
                x={padLeft + i * slot + slot / 2}
                y={H - 6}
                textAnchor="middle"
                fontSize={11}
                fill={isActive ? "#6B5E45" : "#A89B86"}
                fontWeight={isActive ? 700 : 400}
                style={{ pointerEvents: "none" }}
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}

      {/* tooltip */}
      {active != null &&
        (() => {
          const d = data[active];
          const cx = padLeft + active * slot + slot / 2;
          const valTxt = formatValue(d.value);
          const tipTxt = d.tip ?? d.label;
          const txtW = Math.max(valTxt.length, tipTxt.length) * 6.2 + 16;
          const boxW = Math.max(txtW, 54);
          const boxH = 34;
          const bx = Math.min(Math.max(cx - boxW / 2, padLeft), W - padRight - boxW);
          const by = Math.max(y(d.value) - boxH - 8, 2);
          return (
            <g style={{ pointerEvents: "none" }}>
              <line
                x1={cx}
                x2={cx}
                y1={by + boxH}
                y2={padTop + innerH}
                stroke="#6B5E45"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.35}
              />
              <rect x={bx} y={by} width={boxW} height={boxH} rx={7} fill="#3C3528" opacity={0.95} />
              <text x={bx + boxW / 2} y={by + 14} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#FFFFFF">
                {valTxt}
              </text>
              <text x={bx + boxW / 2} y={by + 27} textAnchor="middle" fontSize={10} fill="#D7CDBA">
                {tipTxt}
              </text>
            </g>
          );
        })()}
    </svg>
  );
}
