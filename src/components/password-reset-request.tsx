"use client";

import Link from "next/link";
import { createAuthClient } from "better-auth/react";
import { useState } from "react";

const client = createAuthClient();

export function PasswordResetRequest({ emailReady }: { emailReady: boolean }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!emailReady) {
          setMessage("Password-reset email is not configured yet.");
          return;
        }

        setPending(true);
        setMessage("");
        const email = String(new FormData(event.currentTarget).get("email"))
          .trim()
          .toLowerCase();
        try {
          await client.requestPasswordReset({
            email,
            redirectTo: `${window.location.origin}/reset-password`,
          });
          setMessage(
            "If this email belongs to our space, a reset link is on its way.",
          );
        } catch {
          setMessage("We could not start the reset. Please try again shortly.");
        } finally {
          setPending(false);
        }
      }}
    >
      <label>
        Your email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <button className="button" disabled={pending || !emailReady}>
        {pending ? "Sending link…" : "Send reset link"}
      </button>
      <p role="status">{message}</p>
      <Link className="auth-text-link" href="/login">
        Back to sign in
      </Link>
    </form>
  );
}
