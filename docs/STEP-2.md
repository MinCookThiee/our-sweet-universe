# Step 2 — Database and first account

## What is ready

The configured Neon database has received the initial Drizzle migration (10 application/auth tables). `.env.local` was copied from the original project folder into this checkout without printing its values. It remains ignored by Git. The database branch's production/development label has not been verified; check it in Neon before adding personal content. A separate development branch is preferable for future experiments.

## Create your owner account

Run locally from the project folder:

```sh
pnpm setup:owner
```

Enter your name, login email, couple space name, anniversary date (`YYYY-MM-DD`), timezone, and password. Password entry is hidden, including confirmation. Type `CREATE` at the final prompt to save. Do not send your password through chat or put it in a command argument.

This is an initial bootstrap command for an empty app database. It refuses to run once a user or couple exists. It does not reset passwords, invite partners, or repair partially populated databases.

```sh
pnpm dev
```

Open `http://localhost:3000/login`, sign in, and check `/space`. The Sign out button ends the session and navigates back to login. Stop the server with Ctrl+C.

## Code path ကို နားလည်ဖို့

1. `scripts/owner-input.ts` validates email, password length, real calendar date and timezone.
2. `scripts/setup-owner.ts` uses Better Auth's `hashPassword`; plaintext passwords are never saved. Its credential row uses Better Auth's `credential` provider and the user's ID as account ID.
3. Neon executes the owner, credential, couple and membership inserts in one transaction. If any insert fails, all are rolled back. A transaction lock plus an empty-database guard prevents two simultaneous bootstrap commands creating two owners.
4. Login calls Better Auth, which verifies that hash and creates a session.
5. `requireCouple()` reads the session on the server, then uses Drizzle to join `couple_members` and `couples` for that user. The browser cannot choose its own couple ID.
6. Private memory reads filter by the authorized couple ID. A session without membership gets `/no-access`.

The bootstrap uses parameterized SQL for its guarded multi-statement transaction. Normal application reads remain Drizzle queries. Neon stores the data; Drizzle expresses queries and generates schema migrations; Better Auth manages authentication.

## Validation and remaining work

Type checks, lint, production build and automated date/input/password tests are run during implementation. The first real account must be created interactively by you. Live sign-in/sign-out and two-account authorization checks are still pending; the UI remains an incremental learning project. Do not treat this milestone as a complete privacy/security audit.

References: [Better Auth email/password](https://better-auth.com/docs/authentication/email-password), [Neon transactions](https://neon.com/docs/serverless/serverless-driver).
