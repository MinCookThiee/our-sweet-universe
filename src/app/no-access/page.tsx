import Link from "next/link";
export default function NoAccess() {
  return (
    <main className="entry">
      <div className="entry-card">
        <h1>Your space is not linked yet.</h1>
        <p>
          Your account needs a couple membership before it can read any private
          content.
        </p>
        <Link href="/" className="quiet-link">
          Return home
        </Link>
      </div>
    </main>
  );
}
