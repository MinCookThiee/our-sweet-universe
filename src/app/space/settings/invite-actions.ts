"use server";

import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireCouple, getCurrentSession } from "@/lib/authorization";
import { getAuth } from "@/lib/auth";
import { findOpenInvite, inviteLink, inviteTokenHash, newInviteToken } from "@/lib/couple-invites";
import { getDb } from "@/lib/db";
import { coupleInvites, coupleMembers, user } from "@/lib/db/schema";
import { inviteEmailInput, partnerSignupInput, inviteTokenInput, type InviteActionState } from "@/lib/invite-input";

export async function createPartnerInvite(_previous: InviteActionState, form: FormData): Promise<InviteActionState> {
  const actor = await requireCouple();
  if (actor.role !== "owner") return { message: "Only the owner can invite a partner." };
  const parsed = inviteEmailInput.safeParse({ email: form.get("email") });
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Enter an email address." };
  const db = getDb();
  const members = await db.select({ userId: coupleMembers.userId }).from(coupleMembers).where(eq(coupleMembers.coupleId, actor.coupleId));
  if (members.length > 1) return { message: "Your partner has already joined this space." };
  const [owner] = await db.select({ email: user.email }).from(user).where(eq(user.id, actor.userId)).limit(1);
  if (owner?.email.toLowerCase() === parsed.data.email) return { message: "Use your partner’s email address, not your own." };

  const token = newInviteToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(coupleInvites).values({
    coupleId: actor.coupleId,
    email: parsed.data.email,
    tokenHash: inviteTokenHash(token),
    expiresAt,
  }).onConflictDoUpdate({
    target: coupleInvites.coupleId,
    set: { email: parsed.data.email, tokenHash: inviteTokenHash(token), expiresAt, acceptedAt: null, acceptedBy: null, updatedAt: new Date() },
  });
  return { message: "Your private partner link is ready. It expires in 7 days.", link: inviteLink(token) };
}

export async function createPartnerAccount(_previous: InviteActionState, form: FormData): Promise<InviteActionState> {
  const parsed = partnerSignupInput.safeParse({
    token: form.get("token"), name: form.get("name"), password: form.get("password"), confirmation: form.get("confirmation"),
  });
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Please check your details." };
  const invite = await findOpenInvite(parsed.data.token);
  if (!invite) return { message: "This invite has expired, was used, or is not valid." };
  const db = getDb();
  const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, invite.email)).limit(1);
  if (existing) return { message: "This email already has an account. Sign in below, then return to this invite." };

  const userId = randomUUID();
  const password = await hashPassword(parsed.data.password);
  try {
    const result = await db.execute(sql`
      with valid as (
        select id, couple_id, email from couple_invites
        where token_hash=${inviteTokenHash(parsed.data.token)}
          and email=${invite.email} and expires_at > now() and accepted_at is null
          and not exists(select 1 from couple_members where couple_members.couple_id=couple_invites.couple_id and couple_members.role='partner')
        for update
      ), created_user as (
        insert into "user" (id,name,email,email_verified)
        select ${userId},${parsed.data.name},email,false from valid
        where not exists(select 1 from "user" where email=valid.email)
        returning id
      ), created_account as (
        insert into account (id,account_id,provider_id,user_id,password)
        select ${randomUUID()},id,'credential',id,${password} from created_user
      ), joined as (
        insert into couple_members (couple_id,user_id,role)
        select valid.couple_id,created_user.id,'partner' from valid cross join created_user
        on conflict (user_id) do nothing
        returning couple_id,user_id
      ), claimed as (
        update couple_invites set accepted_at=now(),accepted_by=joined.user_id,updated_at=now()
        from joined where couple_invites.id=(select id from valid)
        returning couple_invites.id
      )
      select exists(select 1 from claimed) as claimed
    `);
    if (!result.rows[0]?.claimed) return { message: "This invite was just used or this account is already in another space." };
  } catch (error) {
    console.error("partner-account-create-failed", error);
    return { message: "We couldn’t create this account. Please try again." };
  }
  try {
    await getAuth().api.sendVerificationEmail({ body: { email: invite.email, callbackURL: "/space" } });
    return { message: "Your account is ready. Check your inbox and confirm your email before entering your shared space.", created: true };
  } catch {
    console.error("partner-email-verification-send-failed");
    return { message: "Your account is ready, but we couldn’t send the confirmation email. Try signing in to send a new link.", created: true };
  }
}

export async function acceptInviteAsExistingUser(_previous: InviteActionState, form: FormData): Promise<InviteActionState> {
  const token = inviteTokenInput.safeParse(form.get("token"));
  if (!token.success) return { message: "This invite link is not valid." };
  const session = await getCurrentSession();
  if (!session) return { message: "Sign in first, then open this link again." };
  const invite = await findOpenInvite(token.data);
  if (!invite) return { message: "This invite has expired, was used, or is not valid." };
  if (session.user.email.toLowerCase() !== invite.email) return { message: "Sign in with the invited email address to accept this link." };
  const result = await getDb().execute(sql`
    with valid as (
      select id,couple_id from couple_invites
      where token_hash=${inviteTokenHash(token.data)} and email=${invite.email}
        and expires_at > now() and accepted_at is null
        and not exists(select 1 from couple_members where couple_members.user_id=${session.user.id})
        and not exists(select 1 from couple_members where couple_members.couple_id=couple_invites.couple_id and couple_members.role='partner')
      for update
    ), joined as (
      insert into couple_members (couple_id,user_id,role)
      select couple_id,${session.user.id},'partner' from valid
      on conflict (user_id) do nothing
      returning couple_id,user_id
    ), claimed as (
      update couple_invites set accepted_at=now(),accepted_by=joined.user_id,updated_at=now()
      from joined where couple_invites.id=(select id from valid)
      returning couple_invites.id
    ) select exists(select 1 from claimed) as claimed
  `);
  if (!result.rows[0]?.claimed) return { message: "This invite was used, or this account is already in a space." };
  revalidatePath("/space", "layout");
  return { message: "You’re in. Open your shared space.", created: true };
}
