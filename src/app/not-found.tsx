import Link from "next/link";
export default function NotFound() {
  return (
    <main className="entry">
      <div className="entry-card">
        <h1>A little lost?</h1>
        <p>This page isn’t part of our story.</p>
        <Link href="/" className="button">
          Back home
        </Link>
      </div>
    </main>
  );
}
