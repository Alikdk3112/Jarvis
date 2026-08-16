# Personal OS

An AI-native personal dashboard: capture by voice from anywhere, let AI route it into
the right place, and see the state of your day — tasks, habits, nutrition, finance,
calendar, journal — in one view.

Built on Next.js 15 (App Router) + Supabase (Postgres + pgvector) + Anthropic Claude
(primary) / OpenAI (fallback + Whisper + embeddings), deployed on Vercel.

## What's here

- **Home** — a 3-column dashboard: Operator, Finance Pulse, Key Blockers, Session,
  Habit Tracker, Calendar, Nutrition.
- **CRM** — tasks across four urgency tiers, in Kanban / Smart (natural-language
  search) / Category views.
- **Brain** — semantic search + an "ask my OS" Q&A over everything you've ever
  captured.
- **Finance** — Finance Pulse in full: AI reads a messy Google Sheet and figures out
  net worth without you labeling anything.
- **Journal** — voice/text captures classified as journal entries, plus weekly/monthly
  goals.
- **Health** — a 30-day nutrition log.
- **Capture pipeline** — a Telegram bot (or the floating capture box on the
  dashboard) feeds voice/text through Whisper + Claude classification into the right
  table, with a memory chunk embedded for later recall.
- **Demo mode** — toggle in the top rail; every card swaps to fake data, nothing
  touches the real DB.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in what you have; see below for what's required
npm run dev
npm run typecheck
```

Without `SUPABASE_SERVICE_ROLE_KEY` / `NEXT_PUBLIC_SUPABASE_URL` set, most API routes
will error — either set them up (see below) or use Demo mode to browse the UI with
fake data.

## Setting up Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Run `supabase/migrations/0001_init.sql` in the SQL editor. It enables `pgvector`,
   creates every table, an ivfflat index for memory search, and enables RLS
   deny-all (the app talks to Postgres exclusively through the service-role key,
   which bypasses RLS — there's no end-user Postgres auth in this single-user build).
3. From *Project Settings → API*, copy the Project URL and the service role key into
   `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.

## Setting up the auth gate

Single password, HMAC-signed cookie — no OAuth needed for a single-user app.

```bash
openssl rand -hex 32   # → AUTH_SECRET
```

Pick any memorable string for `DASHBOARD_PASSWORD`. Optionally set `API_SECRET` (any
random string) so scripts/cron jobs can hit API routes with an `x-api-secret` header
instead of a session cookie.

## Setting up the Telegram capture bot

1. In Telegram, message **@BotFather** → `/newbot`. Save the token as
   `TELEGRAM_BOT_TOKEN`.
2. `openssl rand -hex 16` → `TELEGRAM_WEBHOOK_SECRET`.
3. Message **@userinfobot** to get your numeric user id → `TELEGRAM_USER_ID` (the bot
   only listens to this id).
4. After deploying, register the webhook:
   ```bash
   curl -F "url=https://your-app.vercel.app/api/telegram/webhook" \
        -F "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
        "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook"
   ```

No Telegram? Skip it — the floating capture box on the dashboard posts to the same
`/api/capture` pipeline.

## Setting up Finance Pulse (Google Sheets)

Never use Google's "publish to web" — the sheet stays fully private with a service
account instead.

1. [console.cloud.google.com/projectcreate](https://console.cloud.google.com/projectcreate)
   → create a project → enable the **Drive API**.
2. *IAM → Service Accounts* → create one → generate a JSON key.
3. Open your finance Google Sheet → Share → paste the service account email
   (ends in `@...iam.gserviceaccount.com`) → Viewer.
4. Set `GOOGLE_SHEETS_FINANCE_ID` (the id between `/d/` and `/edit` in the sheet URL),
   `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_SERVICE_ACCOUNT_KEY` (the `private_key`
   field from the JSON — keep the `\n` escapes, the app unescapes them at runtime).

Page loads never trigger the AI extraction — only the card's manual refresh button
or the daily Vercel cron does (see `vercel.json`), so a page full of visitors can't
burn your API budget.

## Setting up the calendar

Google Calendar → Settings → your calendar → *Integrate calendar* → **Secret address
in iCal format**. Set that as `GOOGLE_CALENDAR_ICAL_URL`. No OAuth required.

## Deploying to Vercel

```bash
npm i -g vercel
vercel link
vercel --prod
```

Push every variable from `.env.example` with `vercel env add <NAME> production`, then
redeploy. `vercel.json` already wires the daily finance cron — Vercel sends the
`Authorization: Bearer $CRON_SECRET` header automatically, so set `CRON_SECRET` to
any random value.

## Architecture notes

- **Single user, forward-compatible with multi-user.** Every table carries `user_id`
  (defaults to `USER_ID` env var, a plain string, not a Postgres auth uid). Going
  multi-user later means switching that to `auth.uid()` and adding real RLS policies
  — the schema and API shapes don't need to change.
- **RLS is deny-all.** Every read/write goes through the service-role key from a
  trusted server route, gated by the app's own HMAC-cookie auth — not Postgres auth.
- **Memory is additive.** Every task and capture gets embedded into `memory_chunks`
  (OpenAI `text-embedding-3-small`) best-effort — if `OPENAI_API_KEY` isn't set, the
  write that triggered it still succeeds; memory search on the Brain tab just comes
  back empty until it is.
- **Classifier fallback chain.** Claude → OpenAI → regex. A capture always gets
  filed somewhere, even if both LLM calls fail.
- **Local-clock day boundaries.** Habits and nutrition reset at midnight in *your*
  clock (`lib/localDate.ts`), not the server's UTC — see the "Habits reset at 4am"
  class of bug this avoids.
- **iCal, not node-ical.** `ical.js` (Mozilla's pure-JS parser) — `node-ical`'s
  BigInt usage gets mangled by Next.js's production bundler.

## What's next

Natural extensions once this is running: a 7am Telegram morning briefing (cron +
`sendMessage`), a voice journal routed separately from the CRM, sub-tasks via
`parent_task_id`, bulk-select + undo in the CRM, a nightly cron-to-GitHub backup on
top of `/api/admin/export`, and a read-only public dashboard view for a partner or VA.
