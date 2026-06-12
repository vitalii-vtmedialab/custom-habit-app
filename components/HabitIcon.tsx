"use client";

import {
  BicepsFlexed,
  CircleCheck,
  Droplets,
  Dumbbell,
  Footprints,
  Leaf,
  Moon,
  Pill,
  Salad,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";

export const HABIT_ICONS: Record<string, LucideIcon> = {
  "circle-check": CircleCheck,
  pill: Pill,
  leaf: Leaf,
  dumbbell: Dumbbell,
  biceps: BicepsFlexed,
  footprints: Footprints,
  droplets: Droplets,
  salad: Salad,
  moon: Moon,
  sun: Sun,
  sparkles: Sparkles,
};

export const HABIT_COLORS = [
  "#007AFF",
  "#34C759",
  "#FF9500",
  "#FF3B30",
  "#5856D6",
  "#FF2D55",
  "#30B0C7",
  "#A2845E",
];

export default function HabitIcon({
  icon,
  color,
  size = 36,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  const Icon = HABIT_ICONS[icon] ?? CircleCheck;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: `${color}1F` }}
    >
      <Icon size={size * 0.55} color={color} strokeWidth={2} />
    </div>
  );
}
