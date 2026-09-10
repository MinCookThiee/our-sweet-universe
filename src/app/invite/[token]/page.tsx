import { notFound } from "next/navigation";
import { AcceptInvite } from "@/components/accept-invite";
import { getCurrentSession } from "@/lib/authorization";
import { findOpenInvite } from "@/lib/couple-invites";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [invite, session] = await Promise.all([findOpenInvite(token), getCurrentSession()]);
  if (!invite) notFound();
  return <AcceptInvite token={token} email={invite.email} coupleName={invite.coupleName} signedInEmail={session?.user.email ?? null} />;
}
