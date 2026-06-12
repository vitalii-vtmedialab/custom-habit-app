# Pace — personal habit & goal tracker

Next.js 15 (App Router) + TypeScript + Tailwind + Drizzle ORM. Data in Vercel Postgres (Neon), progress photos in Vercel Blob. Single-user, PIN-gated, no indexing.

## Deploy (one time)

1. **Push to GitHub** — create a repo, then:
   ```bash
   git remote add origin git@github.com:YOURUSER/custom-habit-app.git
   git push -u origin main
   ```
2. **Vercel** → Add New Project → import the repo. Framework auto-detects as Next.js. Deploy will succeed but the app needs storage + env next.
3. **Storage** (Vercel dashboard → your project → Storage tab):
   - Create **Postgres** (Neon) → connect to project. This auto-adds `POSTGRES_URL` etc.
   - Create **Blob** store → connect to project. This auto-adds `BLOB_READ_WRITE_TOKEN`.
4. **Env var**: Settings → Environment Variables → add `APP_PIN` = your PIN (all environments).
5. **Create tables** — locally:
   ```bash
   npm i
   npx vercel link        # link this folder to the Vercel project
   npx vercel env pull .env.local
   npm run db:push        # creates all tables in Neon
   ```
6. Redeploy (or it picks up next push). Done.

## Local dev

```bash
npm i
npx vercel env pull .env.local   # or copy .env.example and fill in
npm run dev
```

No `APP_PIN` set = gate disabled locally.

## iPhone install

Open the Vercel URL in Safari → Share → **Add to Home Screen**. Runs standalone like a native app.

## How the math works

- Distance = speed × time
- Steps = distance ÷ stride (stride ≈ height × 0.415, pace-adjusted)
- Calories = MET (from speed, ACSM walking table) × weight (kg) × hours
- Weight always comes from your latest weigh-in on the Body page

## Privacy

- Every page and API route is PIN-gated via middleware (SHA-256 cookie)
- `robots.txt` disallows all + `X-Robots-Tag: noindex` on every response
- Photos are stored in Blob with unguessable URLs and only served through the authenticated `/api/photos/:id` proxy

## Notes

- Strength weekly goal is effective-dated: changing it this week never rewrites past weeks
- Habits with a course length (e.g. 4-week pills) auto-end on their end date
- "Hit step goal" check-in is automatic and can't be manually checked
