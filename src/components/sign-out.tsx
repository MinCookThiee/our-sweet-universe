"use client";
import { createAuthClient } from "better-auth/react";
import { useState } from "react";
const client = createAuthClient();
export function SignOut() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return <div>
    <button className="button" disabled={pending} onClick={async () => {
      setPending(true); setError("");
      try {
        const result = await client.signOut();
        if (result.error) throw new Error("Sign-out failed");
        window.location.replace("/login");
      } catch { setError("Unable to sign out. Please try again."); setPending(false); }
    }}>{pending ? "Signing out…" : "Sign out"}</button>
    <p role="status">{error}</p>
  </div>;
}
