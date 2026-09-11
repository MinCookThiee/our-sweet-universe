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
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setMessage("");
        const data = new FormData(e.currentTarget);
        try {
          const result = await client.signIn.email({
            email: String(data.get("email")).trim().toLowerCase(),
            password: String(data.get("password")),
          });
          if (result.error) {
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
    </form>
  );
}
