import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { authConfigured, getAuth } from "./auth";
import { getDb } from "./db";
import { coupleMembers, couples } from "./db/schema";

function isTransientConnectionError(error: unknown) {
  const message = error instanceof Error ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}` : "";
  return /fetch failed|ECONNRESET|ETIMEDOUT|socket hang up/i.test(message);
}

async function getSessionWithRetry(requestHeaders: Headers) {
  try {
    return await getAuth().api.getSession({ headers: requestHeaders });
  } catch (error) {
    if (!isTransientConnectionError(error)) throw error;
    // This is a read-only request. One small retry absorbs a temporary Neon
    // network blip without retrying any user mutation.
    await new Promise((resolve) => setTimeout(resolve, 250));
    return getAuth().api.getSession({ headers: requestHeaders });
  }
}
// Call from every private read/write, not only from the layout.
// Never accept coupleId or createdBy from a browser form.
export const requireCouple = cache(async function requireCouple() {
  if (!authConfigured()) redirect("/login");
  const session = await getSessionWithRetry(await headers());
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
