import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't auto-load Next-style env files
config({ path: ".env.local" });
config(); // fallback to .env

const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "No POSTGRES_URL or DATABASE_URL found. Run `npx vercel env pull .env.local` first."
  );
}

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
