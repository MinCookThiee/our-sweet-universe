import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { authConfigured, getAuth } from "./auth";
import { getDb } from "./db";
import { coupleMembers, couples } from "./db/schema";
// Call from every private read/write, not only from the layout.
// Never accept coupleId or createdBy from a browser form.
export const requireCouple = cache(async function requireCouple() {
  if (!authConfigured()) redirect("/login");
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const [membership] = await getDb()
    .select({
      coupleId: coupleMembers.coupleId,
      role: coupleMembers.role,
      name: couples.name,
      cardText: couples.cardText,
      cardRevision: couples.cardRevision,
      togetherSince: couples.togetherSince,
      timezone: couples.timezone,
    })
    .from(coupleMembers)
    .innerJoin(couples, eq(coupleMembers.coupleId, couples.id))
    .where(eq(coupleMembers.userId, session.user.id))
    .limit(1);
  if (!membership) redirect("/no-access");
  return { ...membership, userId: session.user.id };
});
