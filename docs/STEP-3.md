# Step 3 — Real memories, just for your couple

## Try it

With `pnpm dev` running, sign in and open `/space`.

1. Tap **Add memory**, write a title and story, choose a date and optional location.
2. Tick **A milestone in Our Story** if it belongs on the timeline.
3. Save, open the memory, then **Edit memory** to change it.
4. **Delete this memory** expands a separate confirmation. Permanent deletion requires its checkbox.
5. **Settings** lets the owner change the couple name, anniversary date and timezone. The countdown updates from those settings.

Photos arrive in Step 4. Existing attached-media records block deletion until a Cloudinary cleanup workflow is implemented.

## Form → server → database

`MemoryForm` is a client component because it handles pending state, validation messages and draft input. It sends a Server Action POST. It never receives database credentials. Text is held in component state while editing and after validation failures; it is not stored in localStorage and does not survive a reload.

`saveMemory` first calls `requireCouple()`. Better Auth identifies the user; the membership query determines their couple. Form-supplied ownership fields are discarded. Zod validates lengths and real dates. Next.js supplies the Server Action origin checks; the handler still performs its own authorization because actions can be called directly.

Create inserts ownership from the server, with membership rechecked in the SQL statement. A new UUID is generated when the form is opened; retrying the same create cannot insert a second row with that ID. A duplicate returns a message to check Memories instead of overwriting data.

Update and delete use Drizzle:

```ts
await db.update(memories)
  .set({ ...validatedValues, updatedAt: new Date() })
  .where(memoryScope(actor, memoryId))
  .returning({ id: memories.id });
```

`memoryScope` includes memory ID, couple ID and a current membership `EXISTS` check. Zero matching rows are treated as unavailable, without revealing whether another couple owns the ID. Reads use the same boundary. Settings additionally require an owner role in both the server guard and the update predicate.

On success, `revalidatePath('/space', 'layout')` refreshes the private routes and the action redirects to the saved memory. Auth redirects happen outside mutation error handling. Database error details and personal text are not returned to the browser.

## Mobile behavior

Three bottom navigation links, 48px+ touch targets, 16px inputs, a single-column card list and safe-area padding keep the private pages usable on a phone. Forms have pending states, inline errors, a cancel link and a separate delete confirmation. Our Story lists milestones newest first. Memories and milestones paginate in groups of 20 so older entries stay accessible.

## Checks

- Unit tests: dates, validation, ownership-field stripping, pagination and Better Auth password compatibility.
- `pnpm exec tsx scripts/test-memory-isolation.ts`: opt-in live database test. Uses randomized fixture IDs in one transaction, checks own-couple read/update/delete, cross-couple denial and missing membership, then deliberately rolls everything back. Does not edit existing user rows or memories.
- Production build, lint and TypeScript.
- Browser acceptance passed at mobile width: create a temporary memory, edit it, view its milestone in Our Story, confirm deletion and save existing couple settings. Temporary memory removed.
- Unauthenticated private routes redirect to login. Full multi-account HTTP authorization/session testing remains separate from the database isolation check.

## Boundaries still remaining

V2 invites, multi-account live session tests and deployment rate limiting remain future work. Concurrent edits currently use last-write-wins. There is no end-to-end encryption or restore UI. Public `/demo` remains fictional and separate from private `/space`.
