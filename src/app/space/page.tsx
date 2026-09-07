import Link from "next/link";
import { requireCouple } from "@/lib/authorization";
import { listMemories } from "@/lib/memories";
export const dynamic = "force-dynamic";
export default async function Space() {
  const couple = await requireCouple();
  const memories = await listMemories();
  return (
    <main className="content">
      <p className="eyebrow">YOUR PRIVATE SPACE</p>
      <h1>{couple.name}</h1>
      <p>
        Private membership verified. Your memories appear here as the next
        learning steps are connected.
      </p>
      {memories.length ? (
        memories.map((m) => (
          <article className="letter-paper" key={m.id}>
            <h2>{m.title}</h2>
            <p>{m.body}</p>
          </article>
        ))
      ) : (
        <p>No memories yet.</p>
      )}
      <Link className="quiet-link" href="/demo">
        View the UI learning preview
      </Link>
    </main>
  );
}
