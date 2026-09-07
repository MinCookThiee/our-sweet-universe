import { and, eq, sql } from "drizzle-orm";
import { memories, coupleMembers } from "./schema";
// actor is always obtained by requireCouple on the server, never from form data.
export function memoryScope(actor: {coupleId: string; userId: string}, id?: string) {
  return and(
    eq(memories.coupleId, actor.coupleId),
    id ? eq(memories.id, id) : undefined,
    sql`exists (select 1 from ${coupleMembers} where ${coupleMembers.coupleId} = ${memories.coupleId} and ${coupleMembers.userId} = ${actor.userId})`,
  );
}
