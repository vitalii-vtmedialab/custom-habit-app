/**
 * Find the Postgres connection string regardless of how the Vercel/Neon
 * integration named it (DATABASE_URL, POSTGRES_URL, or a prefixed variant
 * like NEON_DATABASE_URL / STORAGE_POSTGRES_URL).
 */
export function findDatabaseUrl(): string | undefined {
  const env = process.env;
  if (env.POSTGRES_URL) return env.POSTGRES_URL;
  if (env.DATABASE_URL) return env.DATABASE_URL;
  const candidates = Object.keys(env)
    .filter((k) => /(DATABASE|POSTGRES)_URL$/.test(k))
    .filter((k) => !/UNPOOLED|NON_POOLING|NO_SSL/.test(k))
    .sort((a, b) => a.length - b.length); // shortest = least decorated
  for (const k of candidates) {
    const v = env[k];
    if (v && /^postgres(ql)?:\/\//.test(v)) return v;
  }
  return undefined;
}
