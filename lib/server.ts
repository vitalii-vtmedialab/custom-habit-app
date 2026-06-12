import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { profile, weighins } from "./schema";

/** Get the profile row, creating defaults on first run. */
export async function getProfile() {
  const rows = await db.select().from(profile).where(eq(profile.id, 1));
  if (rows.length) return rows[0];
  const inserted = await db.insert(profile).values({ id: 1 }).returning();
  return inserted[0];
}

/** Current weight = latest weigh-in, else profile fallback. */
export async function getCurrentWeightLb(): Promise<number> {
  const latest = await db
    .select()
    .from(weighins)
    .orderBy(desc(weighins.date), desc(weighins.id))
    .limit(1);
  if (latest.length) return latest[0].weightLb;
  const p = await getProfile();
  return p.fallbackWeightLb;
}
