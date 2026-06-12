/**
 * Treadmill walking calculations (imperial inputs).
 * Steps/distance from stride length, calories from MET interpolation.
 */

/** MET values for level treadmill walking by speed (mph). ACSM/Compendium-based. */
const MET_TABLE: [number, number][] = [
  [1.0, 2.0],
  [1.5, 2.3],
  [2.0, 2.8],
  [2.5, 3.0],
  [3.0, 3.5],
  [3.5, 4.3],
  [4.0, 5.0],
  [4.5, 7.0],
  [5.0, 8.3],
];

export function metForSpeed(speedMph: number): number {
  const t = MET_TABLE;
  if (speedMph <= t[0][0]) return t[0][1];
  if (speedMph >= t[t.length - 1][0]) return t[t.length - 1][1];
  for (let i = 0; i < t.length - 1; i++) {
    const [s0, m0] = t[i];
    const [s1, m1] = t[i + 1];
    if (speedMph >= s0 && speedMph <= s1) {
      return m0 + ((speedMph - s0) / (s1 - s0)) * (m1 - m0);
    }
  }
  return 3.5;
}

/** Walking stride length (inches) ≈ height × factor, slightly longer at speed. */
export function strideIn(heightIn: number, gender: string, speedMph: number): number {
  const base = heightIn * (gender === "female" ? 0.413 : 0.415);
  // Stride lengthens modestly with pace: ±6% across 2–4 mph.
  const speedAdj = 1 + Math.max(-0.06, Math.min(0.06, (speedMph - 3.0) * 0.04));
  return base * speedAdj;
}

export interface SessionInput {
  durationMin: number;
  speedMph: number;
  heightIn: number;
  weightLb: number;
  gender: string;
}

export interface SessionMetrics {
  distanceMi: number;
  steps: number;
  calories: number;
}

export function computeSession(input: SessionInput): SessionMetrics {
  const hours = input.durationMin / 60;
  const distanceMi = input.speedMph * hours;
  const stride = strideIn(input.heightIn, input.gender, input.speedMph);
  const steps = Math.round((distanceMi * 63360) / stride);
  const weightKg = input.weightLb * 0.45359237;
  const met = metForSpeed(input.speedMph);
  const calories = Math.round(met * weightKg * hours);
  return { distanceMi: Math.round(distanceMi * 100) / 100, steps, calories };
}
