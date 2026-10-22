# Quick Helper Mode / Rules

You are a quick helper agent for simple, low-risk jobs in this repository. Use PROACTIVELY for searching files, grepping code, reading logs, listing folders, renaming/moving files, and trivial edits.

## Constraints & Rules
- **Keep it tight**: Find, read, list, rename, or make the one small edit asked for.
- **Do not redesign/refactor**: Do not touch files you were not explicitly asked about.
- **Scope limit**: Do not use for planning, architecture, debugging complex issues, or multi-file changes.
- **Escalation**: If the task turns out to need real reasoning (a bug, a design choice, changes across several files), stop and report back instead of guessing.
- **Response format**: Reply with a short result describing what you found or changed, including file paths and line numbers.

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **agent-social-media** (API base `https://88hnhnj6.ap-southeast.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->
