"use server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireCouple } from "@/lib/authorization";
import { getDb } from "@/lib/db";
import { couples, coupleMembers } from "@/lib/db/schema";
import { cardTextInput } from "@/lib/card-text";
export async function saveCardText(_previous: {message:string}, form:FormData): Promise<{message:string;success?:boolean;revision?:number}> {
  const actor = await requireCouple();
  const parsed = cardTextInput.safeParse({ribbon:form.get("ribbon"),heading:form.get("heading"),message:form.get("message")});
  const revision = Number(form.get("revision"));
  if (!parsed.success || !Number.isSafeInteger(revision) || revision < 0) return {message:"Check the text lengths and fill in all three fields."};
  try {
    const updated = await getDb().update(couples).set({cardText:parsed.data,cardRevision:sql`${couples.cardRevision} + 1`})
      .where(and(eq(couples.id,actor.coupleId),eq(couples.cardRevision,revision),
        sql`exists(select 1 from ${coupleMembers} where ${coupleMembers.coupleId}=${couples.id} and ${coupleMembers.userId}=${actor.userId})`))
      .returning({id:couples.id});
    if (!updated.length) return {message:"Our card changed while you were editing, or your access changed. Copy your draft and reopen Customize to see the latest version."};
  } catch { return {message:"Couldn’t save right now. Your draft is still here. Please try again."}; }
  revalidatePath("/space","layout");
  return {message:"Saved to our Home.",success:true,revision:revision+1};
}
