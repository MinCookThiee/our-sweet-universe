# Security status and release gates

## Implemented in Step 1

- Private reads require a Better Auth session and couple membership.
- Memory lookup includes BOTH record ID and authorized couple ID; a guessed UUID alone grants nothing.
- Public signup is disabled. No bootstrap or membership HTTP endpoint exists.
- Secrets and repositories import `server-only`; no `NEXT_PUBLIC_` secrets.
- Sample content is fictional and isolated under `/demo`; missing configuration redirects private requests to login.
- Cross-couple media-to-memory attachments are prevented by a composite foreign key.
- HTML renders plain text through React; no raw HTML injection.
- Anti-framing, no-sniff, referrer, permissions and no-index headers. These are hardening, not access controls.
- Better Auth session cookie caching disabled, allowing session checks against the database.

## Required before personal use or deployment

1. Apply migrations to an isolated development Neon branch. Provision one account through a reviewed server-side command using Better Auth password handling, then create couple and membership atomically. Never temporarily open public registration.
2. Integration-test logged-out, missing membership and second-couple reads/writes. Test logout, expired/revoked sessions and direct API access. Current tests cover date edge cases; there is no claim of live database isolation testing yet.
3. Add private CRUD using server-side schemas, field length limits, ownership predicates and trusted author IDs. Validate resource IDs, handle conflicts and avoid leaking stack traces or database details.
4. Configure durable/shared rate limits before multi-instance hosting. Better Auth's current in-memory limits are a development baseline, not a distributed abuse-control guarantee. Include password recovery/rotation and brute-force checks.
5. Serve Cloudinary media as authenticated assets. A signed upload alone does NOT make downloads private. Signed transformation URLs are NOT inherently expiring. Verify originals, derivatives and videos cannot be fetched anonymously; implement authenticated delivery after membership checks and verify any expiring delivery mechanism against the actual plan. No upload or delivery route is exposed in Step 1.
6. Restrict upload size, MIME types, supported formats and duration server-side; verify uploaded metadata and delivery type with Cloudinary before inserting an attachment. Ignore browser-supplied public URLs. Add cleanup for abandoned uploads and deleted records. Do not treat remote asset deletion as a DB cascade.
7. Use HTTPS and exact trusted origins; add a production CSP compatible with the Next.js runtime and intended media delivery, and HSTS on the deployed HTTPS host. Test cookies and CSRF behavior on the actual host.
8. Decide backup retention, export, restore and deletion behavior; avoid logging personal content, credentials or media URLs. Review Neon and Cloudinary access permissions and billing limits before enabling uploads.

This architecture is access-controlled storage, not end-to-end encryption. Hosting, database and media providers can process the content. No public deployment has been made in this milestone.

## Dependency maintenance

The lockfile overrides the legacy `@esbuild-kit/core-utils` transitive esbuild dependency to `^0.25.12`, resolving GHSA-67mh-4wv8-2f99 without downgrading Drizzle Kit. Migration generation was rechecked with the override. Review and remove this override when Drizzle Kit removes the legacy loader. The final installation audit reported zero known vulnerabilities; that is a point-in-time dependency check, not a security certification.
