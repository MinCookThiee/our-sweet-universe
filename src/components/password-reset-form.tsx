"use client";

import Link from "next/link";
import { createAuthClient } from "better-auth/react";
import { useState } from "react";

const client = createAuthClient();

export function PasswordResetForm({ token }: { token?: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <p>
        This reset link is missing or no longer valid.{" "}
        <Link href="/forgot-password">Request a new one.</Link>
      </p>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const password = String(form.get("password"));
        const confirmation = String(form.get("confirmation"));
        if (password !== confirmation) {
          setMessage("The passwords do not match yet.");
          return;
        }

        setPending(true);
        setMessage("");
        try {
          const result = await client.resetPassword({
            newPassword: password,
            token,
          });
          if (result.error)
            setMessage("This reset link has expired. Request a new one.");
          else setDone(true);
        } catch {
          setMessage(
            "We could not reset your password. Please request a new link.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      {done ? (
        <>
          <p>Your password is updated. Please sign in again.</p>
          <Link className="button auth-button-link" href="/login">
            Sign in
          </Link>
        </>
      ) : (
        <>
          <label>
            New password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </label>
          <label>
            Confirm new password
            <input
              name="confirmation"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </label>
          <button className="button" disabled={pending}>
            {pending ? "Saving password…" : "Save new password"}
          </button>
          <p role="status">{message}</p>
        </>
      )}
    </form>
  );
}
