"use server";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCouple } from "@/lib/authorization";
import { getDb } from "@/lib/db";
import { couples, coupleMembers, memories, memoryMedia } from "@/lib/db/schema";
import { memoryScope } from "@/lib/db/memory-scope";
import { memoryInput, coupleInput, type ActionState } from "@/lib/memory-input";

export async function saveMemory(_previous: ActionState, form: FormData): Promise<ActionState> {
  const actor = await requireCouple();
  const id = z.uuid().safeParse(form.get("id"));
  const mode = form.get("mode");
  if (!id.success || (mode !== "create" && mode !== "edit")) return {message: "This form is invalid. Please reopen it."};
  const parsed = memoryInput.safeParse({title: form.get("title"), body: form.get("body"), happenedOn: form.get("happenedOn"), location: form.get("location"), isMilestone: form.get("isMilestone") === "on"});
  if (!parsed.success) return {message: "Please check the highlighted fields.", errors: z.flattenError(parsed.error).fieldErrors};
  const db = getDb();
  try {
    if (mode === "create") {
      const v = parsed.data;
      // Check current membership inside the insert too. IDs from the browser
      // are only idempotency keys; ownership comes exclusively from the session.
      const rows = await db.execute(sql`insert into ${memories} (id,couple_id,created_by,title,body,happened_on,location,is_milestone)
        select ${id.data}::uuid,${actor.coupleId}::uuid,${actor.userId},${v.title},${v.body},${v.happenedOn}::date,${v.location},${v.isMilestone}
        where exists(select 1 from ${coupleMembers} where ${coupleMembers.coupleId}=${actor.coupleId}::uuid and ${coupleMembers.userId}=${actor.userId})
        on conflict (id) do nothing returning id`);
      if (!rows.rows.length) return {message: "Already saved, or access changed. Return to Memories and check before trying again."};
    } else {
      const changed = await db.update(memories).set({...parsed.data, updatedAt: new Date()})
        .where(memoryScope(actor, id.data)).returning({id: memories.id});
      if (!changed.length) return {message: "This memory is no longer available."};
    }
  } catch { return {message: "We couldn’t save this memory. Your text is still here; please try again."}; }
  revalidatePath("/space", "layout");
  redirect(`/space/memories/${id.data}`);
}
export async function deleteMemory(_previous: ActionState, form: FormData): Promise<ActionState> {
  const actor = await requireCouple();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success || form.get("confirm") !== "on") return {message: "Confirm that you want to delete this memory."};
  try {
    // Step 4 must coordinate Cloudinary deletion. Until then refuse deletion of
    // memories with media, so a cascading row delete cannot orphan private files.
    const removed = await getDb().delete(memories).where(and(memoryScope(actor, id.data),
      sql`not exists(select 1 from ${memoryMedia} where ${memoryMedia.memoryId}=${memories.id})`))
      .returning({id: memories.id});
    if (!removed.length) return {message: "This memory is unavailable or has attached media that must be removed first."};
  } catch { return {message: "We couldn’t delete this memory. Please try again."}; }
  revalidatePath("/space", "layout");
  redirect("/space");
}
export async function saveCouple(_previous: ActionState, form: FormData): Promise<ActionState> {
  const actor = await requireCouple();
  if (actor.role !== "owner") return {message: "Only the owner can change these settings."};
  const parsed = coupleInput.safeParse({name: form.get("name"), togetherSince: form.get("togetherSince"), timezone: form.get("timezone")});
  if (!parsed.success) return {message: "Please check these settings.", errors: z.flattenError(parsed.error).fieldErrors};
  try {
    const changed = await getDb().update(couples).set(parsed.data).where(and(eq(couples.id, actor.coupleId),
      sql`exists(select 1 from ${coupleMembers} where ${coupleMembers.coupleId}=${couples.id} and ${coupleMembers.userId}=${actor.userId} and ${coupleMembers.role}='owner')`)).returning({id: couples.id});
    if (!changed.length) return {message: "Your access has changed. Please sign in again."};
  } catch { return {message: "Settings couldn’t be saved. Please try again."}; }
  revalidatePath("/space", "layout");
  return {message: "Saved. Our space is up to date."};
}
