"use client";

/**
 * Apple Watch-inspired double activity ring.
 * Outer = steps (sage), inner = calories (honey).
 * When a metric exceeds its goal, the ring wraps a second lap that
 * overlaps the start with a soft shadow so the overflow reads clearly.
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
  shadowId,
}: {
  cx: number;
  r: number;
  stroke: string;
  track: string;
  progress: number; // 0..1+
  width: number;
  shadowId: string;
}) {
  const C = 2 * Math.PI * r;
  const base = Math.min(progress, 1);
  const over = progress > 1;
  const overflow = over ? Math.min(progress - 1, 1) : 0;

  const arc = (offset: number, extra?: { filter: string }) => (
    <circle
      cx={cx}
      cy={cx}
      r={r}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={C}
      strokeDashoffset={offset}
      transform={`rotate(-90 ${cx} ${cx})`}
      className="ring-progress"
      {...extra}
    />
  );

  return (
    <>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth={width} />
      {/* first lap (full circle once goal is met) */}
      {arc(C * (1 - base))}
      {/* overflow lap, layered on top with a shadow on its leading head */}
      {over && arc(C * (1 - overflow), { filter: `url(#${shadowId})` })}
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
      <defs>
        {/* Soft shadow cast by the overflow head onto the lap beneath it. */}
        <filter id="ringOverflowShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="2.4" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>
      <Ring
        cx={c}
        r={rOuter}
        stroke="#7FAE74"
        track="#ECF3E9"
        progress={stepPct}
        width={w}
        shadowId="ringOverflowShadow"
      />
      <Ring
        cx={c}
        r={rInner}
        stroke="#E8A93C"
        track="#FAF0DA"
        progress={calPct}
        width={w}
        shadowId="ringOverflowShadow"
      />
    </svg>
  );
}
