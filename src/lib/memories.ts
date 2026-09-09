import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
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

export async function homeMemorySnapshot() {
  const actor = await requireCouple();
  const db = getDb();
  const [latest] = await db
    .select()
    .from(memories)
    .where(memoryScope(actor))
    .orderBy(desc(memories.happenedOn), desc(memories.id))
    .limit(1);
  const [milestone] = await db
    .select()
    .from(memories)
    .where(and(memoryScope(actor), eq(memories.isMilestone, true)))
    .orderBy(desc(memories.happenedOn), desc(memories.id))
    .limit(1);
  const [total] = await db
    .select({ value: count() })
    .from(memories)
    .where(memoryScope(actor));
  return { latest: latest ?? null, milestone: milestone ?? null, total: total?.value ?? 0 };
}
