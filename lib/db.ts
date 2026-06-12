import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Neon stores on Vercel inject DATABASE_URL; older Vercel Postgres used POSTGRES_URL.
// Placeholder keeps module loadable at build time; queries fail loudly if env is missing.
const url =
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  "postgres://missing:env@localhost/missing";

export const db = drizzle(neon(url), { schema });
