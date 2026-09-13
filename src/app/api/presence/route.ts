import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { requireCouple } from "@/lib/authorization";
import { getDb } from "@/lib/db";
import { coupleMembers, user } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function POST() {
  const actor = await requireCouple();
  await getDb()
    .update(user)
    .set({ lastActiveAt: new Date() })
    .where(eq(user.id, actor.userId));

  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  const actor = await requireCouple();
  const [partner] = await getDb()
    .select({ name: user.name, lastActiveAt: user.lastActiveAt })
    .from(coupleMembers)
    .innerJoin(user, eq(coupleMembers.userId, user.id))
    .where(and(eq(coupleMembers.coupleId, actor.coupleId), ne(coupleMembers.userId, actor.userId)))
    .limit(1);

  return NextResponse.json({
    partner: partner
      ? { name: partner.name, lastActiveAt: partner.lastActiveAt?.toISOString() ?? null }
      : null,
  });
}
