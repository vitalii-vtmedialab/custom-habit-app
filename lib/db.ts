import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { findDatabaseUrl } from "./dburl";

// Placeholder keeps module loadable at build time; queries fail loudly if env is missing.
const url = findDatabaseUrl() ?? "postgres://missing:env@localhost/missing";

export const db = drizzle(neon(url), { schema });
