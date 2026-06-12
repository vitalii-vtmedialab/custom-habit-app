import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { findDatabaseUrl } from "./lib/dburl";

// drizzle-kit doesn't auto-load Next-style env files
config({ path: ".env.local" });
config(); // fallback to .env

const url = findDatabaseUrl();
if (!url) {
  const names = Object.keys(process.env).filter((k) => /URL|POSTGRES|DATABASE|PG/.test(k));
  throw new Error(
    `No Postgres connection string found. URL-ish vars present: ${names.join(", ") || "none"}. ` +
      "Run `npx vercel env pull .env.local --environment=production` first."
  );
}

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
