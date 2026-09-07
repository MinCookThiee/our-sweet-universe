import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireCouple } from "./authorization";
import { getDb } from "./db";
import { memories } from "./db/schema";
import { memoryScope } from "./db/memory-scope";
export async function listMemories(page = 1, milestonesOnly = false) {
  const actor = await requireCouple();
  return getDb()
    .select()
    .from(memories)
    .where(
      and(
        memoryScope(actor),
        milestonesOnly ? eq(memories.isMilestone, true) : undefined,
      ),
    )
    .orderBy(desc(memories.happenedOn), desc(memories.id))
    .limit(21)
    .offset((page - 1) * 20);
}
export async function findMemory(id: string) {
  const actor = await requireCouple();
  if (!z.uuid().safeParse(id).success) return null;
  const [memory] = await getDb()
    .select()
    .from(memories)
    .where(memoryScope(actor, id))
    .limit(1);
  return memory ?? null;
}
