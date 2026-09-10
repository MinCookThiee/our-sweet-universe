import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "./db";
import { coupleInvites, couples } from "./db/schema";
import { inviteTokenInput } from "./invite-input";

export function newInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function inviteTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function inviteLink(token: string) {
  const base = process.env.BETTER_AUTH_URL;
  if (!base) throw new Error("Private sign-in is not configured.");
  return new URL(`/invite/${token}`, base).toString();
}

export async function findOpenInvite(token: string) {
  if (!inviteTokenInput.safeParse(token).success) return null;
  const [invite] = await getDb()
    .select({
      id: coupleInvites.id,
      coupleId: coupleInvites.coupleId,
      email: coupleInvites.email,
      coupleName: couples.name,
    })
    .from(coupleInvites)
    .innerJoin(couples, eq(coupleInvites.coupleId, couples.id))
    .where(
      and(
        eq(coupleInvites.tokenHash, inviteTokenHash(token)),
        gt(coupleInvites.expiresAt, new Date()),
        isNull(coupleInvites.acceptedAt),
      ),
    )
    .limit(1);
  return invite ?? null;
}
