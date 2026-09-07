import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { authConfigured } from "@/lib/auth";
import { SignIn } from "@/components/sign-in";
export const dynamic = "force-dynamic";
export default function Login() {
  const configured = authConfigured();
  return (
    <main className="entry">
      <div className="entry-card setup-card">
        <LockKeyhole className="accent" />
        <p className="eyebrow">OUR PRIVATE SPACE</p>
        <h1>{configured ? "Welcome back." : "A little setup first."}</h1>
        {configured ? (
          <SignIn />
        ) : (
          <>
            <p>
              Private sign-in isn’t connected yet. Your developer setup guide
              explains how to connect the database and create the first account.
            </p>
            <p>
              You can explore fictional examples while the private space is
              being prepared.
            </p>
          </>
        )}
        <Link className="quiet-link" href="/demo">
          Explore the sample preview →
        </Link>
      </div>
    </main>
  );
}
