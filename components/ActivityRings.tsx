"use client";

/**
 * Apple Watch-inspired double activity ring.
 * Outer = steps (green), inner = calories (red/pink).
 */
interface Props {
  steps: number;
  stepGoal: number;
  calories: number;
  calorieGoal: number;
  size?: number;
}

function Ring({
  cx,
  r,
  stroke,
  progress,
  track,
  width,
}: {
  cx: number;
  r: number;
  stroke: string;
  track: string;
  progress: number; // 0..1+
  width: number;
}) {
  const C = 2 * Math.PI * r;
  const p = Math.min(progress, 1);
  return (
    <>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth={width} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - p)}
        transform={`rotate(-90 ${cx} ${cx})`}
        className="ring-progress"
      />
    </>
  );
}

export default function ActivityRings({
  steps,
  stepGoal,
  calories,
  calorieGoal,
  size = 190,
}: Props) {
  const c = size / 2;
  const w = size * 0.105;
  const rOuter = c - w / 2 - 1;
  const rInner = rOuter - w - 3;
  const stepPct = stepGoal > 0 ? steps / stepGoal : 0;
  const calPct = calorieGoal > 0 ? calories / calorieGoal : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Steps ${steps} of ${stepGoal}, calories ${calories} of ${calorieGoal}`}
    >
      <Ring cx={c} r={rOuter} stroke="#32D74B" track="#E8F9EC" progress={stepPct} width={w} />
      <Ring cx={c} r={rInner} stroke="#FF375F" track="#FFE9ED" progress={calPct} width={w} />
    </svg>
  );
}
