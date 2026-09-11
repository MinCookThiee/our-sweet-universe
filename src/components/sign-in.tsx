"use client";
import { createAuthClient } from "better-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
const client = createAuthClient();
export function SignIn({ next = "/space" }: { next?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setMessage("");
        const data = new FormData(e.currentTarget);
        const email = String(data.get("email")).trim().toLowerCase();
        try {
          const result = await client.signIn.email({
            email,
            password: String(data.get("password")),
          });
          if (result.error) {
            setUnverifiedEmail(email);
            setMessage(
              result.error.status === 403
                ? "Please confirm your email first. We sent a fresh link to your inbox."
                : "Sign-in failed. Check your details and try again.",
            );
          }
          else {
            router.push(next);
            router.refresh();
          }
        } catch {
          setUnverifiedEmail(email);
          setMessage("Unable to sign in. Please try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={12}
        />
      </label>
      <Link className="login-forgot-link" href="/forgot-password">
        Forgot password?
      </Link>
      <button className="button" disabled={pending}>
        {pending ? "Signing in…" : "Enter our space"}
      </button>
      <p role="status">{message}</p>
      {unverifiedEmail ? (
        <button
          className="verification-resend"
          type="button"
          disabled={resending}
          onClick={async () => {
            setResending(true);
            setMessage("");
            try {
              const result = await client.sendVerificationEmail({
                email: unverifiedEmail,
                callbackURL: "/space",
              });
              setMessage(
                result.error
                  ? "We couldn’t send a confirmation link. Please try again shortly."
                  : "If this email needs confirmation, a fresh link is on its way.",
              );
            } catch {
              setMessage("We couldn’t send a confirmation link. Please try again shortly.");
            } finally {
              setResending(false);
            }
          }}
        >
          {resending ? "Sending confirmation link…" : "Resend confirmation link"}
        </button>
      ) : null}
    </form>
  );
}
