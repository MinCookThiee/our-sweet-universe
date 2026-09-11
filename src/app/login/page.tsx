import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { authConfigured } from "@/lib/auth";
import { getCurrentSession } from "@/lib/authorization";
import { SignIn } from "@/components/sign-in";
export const dynamic = "force-dynamic";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const configured = authConfigured();
  const requested = (await searchParams).next;
  const next =
    typeof requested === "string" && requested.startsWith("/invite/")
      ? requested
      : "/space";
  if (configured && (await getCurrentSession())) redirect(next);
  return (
    <main className="entry">
      <div className="entry-card setup-card">
        <LockKeyhole className="accent" />
        <p className="eyebrow">OUR PRIVATE SPACE</p>
        <h1>{configured ? "Welcome back." : "A little setup first."}</h1>
        {configured ? (
          <SignIn next={next} />
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
      </div>
    </main>
  );
}
