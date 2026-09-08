# Shared card text

Open Home → Customize card. Edit the ribbon names (32 characters), heading (70), and message (160). The live preview is local draft state only. Reset changes the draft to the defaults; Save is required to publish either edits or a reset. Cancel discards the draft. Reloading before Save loses unsaved text.

Saved text lives in `couples.card_text`, separate from login names. The server derives couple identity from the authenticated membership and rechecks membership inside the update. Both owner and partner can customize the shared card. `card_revision` prevents a stale editor from overwriting newer changes; reopen Customize if a conflict is reported.

Other devices see saved changes on refresh/navigation. This does not implement live push updates or photo uploads. Cloudinary remains a separate milestone.

Migration `0001_loving_violations.sql` adds nullable card text and a revision counter without changing existing memories. It has been applied locally to the configured Neon database. Apply migrations for a separate deployment database before deploying code that reads the new fields.

Verified: validation tests, lint, TypeScript via production build, and browser edit-preview → reset → save. The browser test saved the existing displayed wording.
