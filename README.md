# Our Sweet Universe

A private couple app, built incrementally as a learning project.

**Current milestone: Step 1 — runnable UI and security/data foundations.** This is not yet a complete V1 or ready for personal data. The seven feature screens are a clearly marked fictional preview. Authentication configuration, a membership guard, scoped memory reads, and a migration are included; first-account provisioning, private editing, and media delivery are later milestones.

## Run locally

Use Node.js 22.13+ (tested on Node 24) and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000/demo. No credentials are needed for the fictional preview. It never writes to localStorage, a database, or Cloudinary. `/space` redirects to login when the app is unconfigured. Do not enter real private content into the demo.

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

## Read the project in this order

1. `src/app/layout.tsx` — common HTML shell and metadata.
2. `src/app/demo/[[...section]]/page.tsx` — Next.js routes to all seven preview screens.
3. `src/components/shell.tsx` — navigation and responsive layout.
4. `src/components/preview.tsx` — sample UI interactions; separate from private storage.
5. `src/lib/db/schema.ts` — Drizzle tables, foreign keys and indexes.
6. `src/lib/auth.ts` — Better Auth with Drizzle and closed public registration.
7. `src/lib/authorization.ts` — session-to-couple authorization boundary.
8. `src/lib/memories.ts` — SQL-shaped queries with couple filtering.

Read [the architecture](docs/ARCHITECTURE.md), [Step 1 walkthrough](docs/STEP-1.md), and [security and next steps](docs/SECURITY.md).

## Environment setup (next milestone)

Copy `.env.example` to `.env.local`. Keep real values out of Git and chat. `DATABASE_URL` is a Neon PostgreSQL connection string. `BETTER_AUTH_SECRET` must contain at least 32 cryptographically random characters; `BETTER_AUTH_URL` is the exact app origin. Cloudinary settings stay server-side and are not needed for Step 1.

```sh
npm run db:generate
# Review generated SQL before applying to your development Neon branch.
npm run db:migrate
```

The included migration has been generated, not applied to a remote database. Do not run migrations against production as part of casual UI testing. Public signup is deliberately disabled; the next milestone adds a one-time server-side account provisioning command and creates the initial couple membership. There is no signup bypass hidden in the demo.

## V1 delivery sequence

- [x] Step 1: architecture, seven-route UI preview, schema, auth configuration, scoped read foundation.
- [ ] Step 2: development Neon branch, migration integration checks, one-time owner provisioning, sign-in/sign-out, membership and session tests.
- [ ] Step 3: private couple settings, anniversary date, memories CRUD and Our Story milestones; input validation and authorization tests.
- [ ] Step 4: authenticated Cloudinary upload and delivery, gallery, ownership checks and deletion cleanup.
- [ ] Step 5: private letters and jar CRUD; couple-filtered random note selection.
- [ ] Step 6: live integration tests, backups and restore, deployment hardening and private hosting.

V2 adds an expiring single-use invite for a second account, with transactional capacity enforcement, revocation and account recovery. Every V1 object already has `coupleId` and `createdBy`.

## Stack

Next.js App Router + React + TypeScript; Tailwind CSS; Better Auth; Drizzle ORM; Neon PostgreSQL; Cloudinary SDK. Exact installed versions are recorded in `package-lock.json`.

References: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Better Auth Drizzle adapter](https://better-auth.com/docs/adapters/drizzle), [Drizzle Neon guide](https://orm.drizzle.team/docs/connect-neon), [Cloudinary access control](https://cloudinary.com/documentation/control_access_to_media).

### Restricted macOS development environments

If the development watcher reports `EMFILE`, run `WATCHPACK_POLLING=true npm run dev`. The preview in this session was checked with polling enabled. This avoids changing system-wide file limits.
