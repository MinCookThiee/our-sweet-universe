# V1 architecture

The unit of privacy is a couple space. An account is an identity; membership grants access to a space. V1 provisions one account. V2 grants a second identity membership of the existing space.

```text
Browser
  ├─ /demo/* → fictional, public, read-only preview
  ├─ /login → Better Auth client → /api/auth/* → Drizzle → Neon
  └─ /space → server → requireCouple()
                         ├─ validate Better Auth session
                         ├─ query membership for session.user.id
                         └─ query content WHERE couple_id = membership.coupleId

Future media path:
Browser → authenticated app route → membership + media ownership check
        → Cloudinary authenticated asset delivery
```

## Responsibilities

| Technology  | Its job here                                                             |
| ----------- | ------------------------------------------------------------------------ |
| Next.js     | Routes, server-rendered private pages, server actions and API endpoints  |
| Tailwind    | Shared styling entry point; custom theme and responsive component styles |
| Better Auth | Credential verification and session cookies                              |
| Drizzle     | Typed table definitions and parameterized SQL queries                    |
| Neon        | The actual PostgreSQL database                                           |
| Cloudinary  | Image/video processing and storage; server SDK foundation only for now   |

## Data model

- `user`, `session`, `account`, `verification`: Better Auth records. Let Better Auth own password and token operations.
- `couples`: name, start date and IANA timezone. The countdown is derived, never stored as a stale number.
- `couple_members`: composite primary key `(coupleId, userId)` and one-space-per-user constraint. The initial role is owner; V2 can add a partner.
- `memories`: space ownership, author, calendar date, body, optional location and milestone flag. Our Story is the milestone view of memories.
- `memory_media`: ordered attachments. A composite foreign key requires its memory and media to belong to the same couple. Store Cloudinary IDs, not permanent delivery URLs.
- `letters`: couple-owned plain text letters with an author. Scheduled unlocking is outside initial V1.
- `jar_notes`: short couple-owned notes with an author. Pick only from the authorized couple in the future server implementation.

Dates describing a day use PostgreSQL `date`; event timestamps use `timestamptz`. Indexes begin with `coupleId` where listing private content is the main access pattern. Foreign keys prevent orphan records. Database constraints complement, but do not replace, application authorization.

Membership removal does not erase author attribution. A user with authored content cannot currently be deleted by foreign-key cascade; implement a deliberate export/deletion/anonymization policy before account deletion. Media deletion must also remove the Cloudinary object; a PostgreSQL cascade cannot delete a remote file.

## V2 migration

Existing content stays attached to the same couple ID. Create the partner account, verify and redeem an expiring invite in a transaction, and insert its membership. Reactions and comments should carry couple and author IDs and use composite foreign keys where relevant. The current schema does not enforce a maximum of two members; the invite transaction must lock the couple row and enforce capacity to prevent concurrent invite races. Do not expose membership writes before that exists.

## Current boundaries

No end-to-end private write path is exposed. The private server page can list existing authorized memories after provisioning. The UI preview never calls the private repository. No environment flag can switch demo data into the authenticated repository. This separation prevents a missing credential from quietly turning a private route into a public demo.
