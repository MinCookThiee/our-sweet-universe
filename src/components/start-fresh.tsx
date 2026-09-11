"use client";

import { useActionState } from "react";
import { RotateCcw } from "lucide-react";
import { startFresh, type StartFreshState } from "@/app/space/settings/cleanup-actions";

const initialState: StartFreshState = { message: "" };

export function StartFresh() {
  const [state, action, pending] = useActionState(startFresh, initialState);
  return (
    <section className="start-fresh">
      <RotateCcw aria-hidden="true" />
      <div>
        <p className="eyebrow">BEFORE WE BEGIN</p>
        <h2>Start our story fresh.</h2>
        <p>Clear test memories, gallery and heart-card photos, plus test question progress. Your accounts, details and question bank stay safe.</p>
      </div>
      {state.complete ? <p role="status" className="form-status">{state.message}</p> : state.stage === "otp" ? (
        <form action={action}>
          <input type="hidden" name="intent" value="confirm" />
          <label htmlFor="start-fresh-code">6-digit code from your email</label>
          <input id="start-fresh-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required disabled={pending} />
          <button className="button button-danger" disabled={pending}>{pending ? "Confirming…" : "Confirm and clear test data"}</button>
          <p role="status" className="form-status">{state.message}</p>
        </form>
      ) : (
        <form action={action}>
          <input type="hidden" name="intent" value="request" />
          <label htmlFor="start-fresh-confirmation">Type <strong>DELETE OUR TEST DATA</strong> to confirm</label>
          <input id="start-fresh-confirmation" name="confirmation" autoComplete="off" disabled={pending} />
          <label htmlFor="start-fresh-password">Your password</label>
          <input id="start-fresh-password" name="password" type="password" autoComplete="current-password" required disabled={pending} />
          <button className="button button-danger" disabled={pending}>{pending ? "Sending code…" : "Send confirmation code"}</button>
          <p role="status" className="form-status">{state.message}</p>
        </form>
      )}
    </section>
  );
}
