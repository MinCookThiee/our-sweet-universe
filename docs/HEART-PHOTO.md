# Heart photo

With no photo: Home → Add photo. With an existing photo: Pencil → Change photo. Then choose JPG, PNG or WebP (up to 4 MiB) → adjust zoom and horizontal/vertical position → Save photo. Use Pencil → Change photo to reposition, replace, or remove with confirmation. Existing photos have no overlay in normal viewing mode. Saving a photo preserves any unsaved card text draft. Cancel and Escape discard the draft. One shared photo is supported; this is independent of text editing. HEIC must first be exported as JPG. Crop edits retain the normalized original, so repositioning does not repeatedly recompress it.

## Setup

Apply reviewed migration `0002_heart_photo.sql` with `pnpm db:migrate` to the intended database before starting this version. It adds nullable photo metadata, a revision counter, a shared upload cooldown timestamp, and an upload-intent ledger. It does not rewrite existing memories or card text.

Existing server-only Cloudinary environment keys are used. `BETTER_AUTH_URL` must match the browser's exact origin (including localhost versus 127.0.0.1). No unsigned preset or public media URL is required.

## Privacy and failure handling

- Upload/PATCH/DELETE check the configured Origin, session, and couple membership. SQL rechecks membership and revision. Upload intent reservation is shared across instances: 10-second cooldown, up to 20 upload attempts per couple per hour.
- Request bytes are bounded while reading, regardless of Content-Length. MIME headers and raster signatures must match. Cloudinary decodes/re-encodes to JPEG, limits to 1600×1600, strips profiles, and returns metadata checked by the server. SVG, GIF, video and remote URL inputs are not accepted.
- Cloudinary assets use `authenticated` delivery. Clients see only `/api/heart-photo/[id]`; this route checks current membership and current photo ID, then proxies a short-lived signed download. It never redirects to the provider URL. Responses are private/no-store; no public image optimizer is used. This costs server/provider bandwidth.
- Crop coordinates are validated. Server-generated asset IDs and dimensions cannot be set through PATCH. Revisions prevent stale editors overwriting newer changes.
- Every upload is recorded before the provider call. A failed request cannot lose the cleanup reference. Publication expires after 30 minutes; unreferenced intents older than one hour are eligible for cleanup. Replaced/removed photos are deleted immediately when possible; failures remain eligible for retry. Removing a photo immediately stops application delivery, even if provider deletion is delayed.
- Opportunistic cleanup processes up to two candidates per mutation. Run `pnpm media:cleanup` regularly to retry cleanup when there is no user activity. No scheduler is installed by this change. Provider backups and retention settings remain separately managed; this is not end-to-end encryption.

## Checks

`node --import tsx --test tests/*.test.ts`, `pnpm lint`, `pnpm typecheck`, `pnpm build`.

Opt-in live DB isolation test (all fixtures rolled back):
`node --conditions=react-server --import tsx scripts/test-heart-photo-isolation.ts`.

Before personal use, verify configured-provider upload/download, anonymous denial for originals and derivatives, logged-out and second-couple HTTP denial, replacement/removal and cleanup. Never log credentials, provider URLs, or uploaded personal content.

## Verification in this checkout

Migration 0002 was applied to the configured database with user approval. The photo isolation script passed and fixture rollback was verified. Unit validation tests passed; the editor preview, crop sliders, reset, removal confirmation and cancel were checked using a synthetic image in an isolated local preview. Live Cloudinary upload/delivery, logged-out and second-couple denial, anonymous original/derivative denial, stale-update denial, removal and provider cleanup all passed with generated test data. Test fixtures and sessions were removed afterward.
