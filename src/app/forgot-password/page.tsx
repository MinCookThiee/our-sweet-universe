import { KeyRound } from "lucide-react";
import { PasswordResetRequest } from "@/components/password-reset-request";
import { emailConfigured } from "@/lib/email";

export default function ForgotPasswordPage() {
  return (
    <main className="setup-page">
      <section className="setup-card">
        <KeyRound aria-hidden="true" />
        <p className="eyebrow">OUR PRIVATE SPACE</p>
        <h1>Find your way back.</h1>
        <p>
          Enter the email you use for your shared space and we’ll send a private
          reset link.
        </p>
        <PasswordResetRequest emailReady={emailConfigured()} />
      </section>
    </main>
  );
}
