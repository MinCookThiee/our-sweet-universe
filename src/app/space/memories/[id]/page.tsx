import Link from "next/link";
import { notFound } from "next/navigation";
import { findMemory } from "@/lib/memories";
import { DeleteMemory } from "@/components/memory-form";
export default async function MemoryPage({params}: {params:Promise<{id:string}>}) {
  const memory = await findMemory((await params).id);
  if (!memory) notFound();
  return <><Link className="quiet-link" href="/space">← Our memories</Link><article className="private-paper">
    <p className="eyebrow">{memory.isMilestone ? "A CHAPTER IN OUR STORY" : "A MOMENT WE KEPT"}</p>
    <h1>{memory.title}</h1><time dateTime={memory.happenedOn}>{memory.happenedOn}</time>
    {memory.location && <p>{memory.location}</p>}<div className="memory-body">{memory.body}</div>
    <Link className="button" href={`/space/memories/${memory.id}/edit`}>Edit memory</Link>
  </article><DeleteMemory id={memory.id} /></>;
}
