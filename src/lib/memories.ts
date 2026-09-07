import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireCouple } from "./authorization";
import { getDb } from "./db";
import { memories } from "./db/schema";
export async function listMemories() {
  const { coupleId } = await requireCouple();
  return getDb()
    .select()
    .from(memories)
    .where(eq(memories.coupleId, coupleId))
    .orderBy(desc(memories.happenedOn))
    .limit(100);
}
export async function findMemory(id: string) {
  const memoryId = z.uuid().parse(id);
  const { coupleId } = await requireCouple();
  const [memory] = await getDb()
    .select()
    .from(memories)
    .where(and(eq(memories.id, memoryId), eq(memories.coupleId, coupleId)))
    .limit(1);
  return memory ?? null;
}
