"use client";

import { useActionState, useState } from "react";
import { Copy, HeartHandshake, MailCheck } from "lucide-react";
import { createPartnerInvite } from "@/app/space/settings/invite-actions";
import type { InviteActionState } from "@/lib/invite-input";

const initial: InviteActionState = { message: "" };

export function PartnerInvite({ partner }: { partner: { name: string; email: string } | null }) {
  const [state, action, pending] = useActionState(createPartnerInvite, initial);
  const [copied, setCopied] = useState(false);
  if (partner) return <section className="partner-panel"><HeartHandshake aria-hidden="true" /><div><p className="eyebrow">YOUR PERSON</p><h2>{partner.name} is here.</h2><p>{partner.email} is part of this shared space.</p></div></section>;
  return <section className="partner-panel"><MailCheck aria-hidden="true" /><div><p className="eyebrow">INVITE YOUR PERSON</p><h2>Make this a space for two.</h2><p>Create one private link for your partner’s email. It expires after 7 days.</p></div><form action={action} className="partner-invite-form"><label htmlFor="partner-email">Their email address</label><input id="partner-email" name="email" type="email" autoComplete="email" required placeholder="her@email.com" disabled={pending} /><button className="button" type="submit" disabled={pending}>{pending ? "Making link…" : "Create private link"}</button></form>{state.link ? <div className="invite-link"><label htmlFor="partner-link">Share this only with your partner</label><div><input id="partner-link" value={state.link} readOnly /><button type="button" aria-label="Copy partner invite link" onClick={async () => { try { await navigator.clipboard.writeText(state.link!); setCopied(true); } catch { setCopied(false); } }}>{copied ? "Copied" : <Copy size={18} aria-hidden="true" />}</button></div></div> : null}<p role="status" className="form-status">{state.message}</p></section>;
}
