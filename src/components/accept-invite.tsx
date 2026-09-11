"use client";

import Link from "next/link";
import { useActionState } from "react";
import { HeartHandshake, LockKeyhole } from "lucide-react";
import { acceptInviteAsExistingUser, createPartnerAccount } from "@/app/space/settings/invite-actions";
import type { InviteActionState } from "@/lib/invite-input";

const initial: InviteActionState = { message: "" };

export function AcceptInvite({ token, email, coupleName, signedInEmail }: { token: string; email: string; coupleName: string; signedInEmail: string | null }) {
  const [signupState, signupAction, signupPending] = useActionState(createPartnerAccount, initial);
  const [existingState, existingAction, existingPending] = useActionState(acceptInviteAsExistingUser, initial);
  const loginHref = `/login?next=${encodeURIComponent(`/invite/${token}`)}`;
  return <main className="entry"><section className="invite-entry"><HeartHandshake aria-hidden="true" /><p className="eyebrow">YOU’RE INVITED</p><h1>Join {coupleName}.</h1><p>This link is for <strong>{email}</strong>. Create your private account to share this space together.</p>{signedInEmail ? <div className="invite-signed-in"><LockKeyhole aria-hidden="true" /><p>Signed in as <strong>{signedInEmail}</strong></p>{signedInEmail.toLowerCase() === email.toLowerCase() ? <form action={existingAction}><input type="hidden" name="token" value={token} /><button className="button" disabled={existingPending}>{existingPending ? "Joining…" : "Join our shared space"}</button></form> : <p>Sign out, then sign in with the invited email to accept this link.</p>}<p role="status">{existingState.message}</p>{existingState.created ? <Link className="button" href="/space">Open our space</Link> : null}</div> : <><form action={signupAction} className="invite-signup"><input type="hidden" name="token" value={token} /><label htmlFor="partner-name">Your name</label><input id="partner-name" name="name" autoComplete="name" required maxLength={100} disabled={signupPending} /><label>Email</label><input value={email} readOnly aria-readonly="true" /><label htmlFor="partner-password">Choose a password</label><input id="partner-password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={signupPending} /><label htmlFor="partner-confirmation">Confirm password</label><input id="partner-confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={signupPending} /><button className="button" disabled={signupPending}>{signupPending ? "Creating account…" : "Create my account"}</button></form><p role="status">{signupState.message}</p>{signupState.created ? <Link className="button" href={loginHref}>I’ve confirmed my email</Link> : <p className="invite-existing">Already have an account? <Link href={loginHref}>Sign in first</Link>.</p>}</>}</section></main>;
}
