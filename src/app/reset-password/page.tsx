import { KeyRound } from "lucide-react";
import { PasswordResetForm } from "@/components/password-reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const resetToken = typeof token === "string" ? token : undefined;

  return (
    <main className="setup-page">
      <section className="setup-card">
        <KeyRound aria-hidden="true" />
        <p className="eyebrow">OUR PRIVATE SPACE</p>
        <h1>A fresh little key.</h1>
        <p>Choose a new password with at least 12 characters.</p>
        <PasswordResetForm token={resetToken} />
      </section>
    </main>
  );
}
