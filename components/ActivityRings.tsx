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

  // Leading-head position for the overflow lap (clockwise from top).
  const angle = 2 * Math.PI * overflow;
  const hx = cx + r * Math.sin(angle);
  const hy = cx - r * Math.cos(angle);

  return (
    <>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth={width} />
      {/* first lap — rounded head while filling, full circle once goal is met */}
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - base)}
        transform={`rotate(-90 ${cx} ${cx})`}
        className="ring-progress"
      />
      {over && (
        <g filter={`url(#${shadowId})`}>
          {/* overflow lap floats over the first — flat start (no "new circle" seam),
              rounded head, shadow along the whole lap for Apple-style depth */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={width}
            strokeLinecap="butt"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - overflow)}
            transform={`rotate(-90 ${cx} ${cx})`}
            className="ring-progress"
          />
          {/* rounded leading head */}
          <circle cx={hx} cy={hy} r={width / 2} fill={stroke} />
        </g>
      )}
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
          <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
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
