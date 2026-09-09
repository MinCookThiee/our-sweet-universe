import Link from "next/link";
/* eslint-disable @next/next/no-img-element -- private media is served through the session-protected app endpoint. */
import { notFound } from "next/navigation";
import { findMemory } from "@/lib/memories";
import { requireCouple } from "@/lib/authorization";
import { listMemoryMedia } from "@/lib/media";
export default async function MemoryPage({params}: {params:Promise<{id:string}>}) {
  const id = (await params).id;
  const couple = await requireCouple();
  const [memory, media] = await Promise.all([findMemory(id), listMemoryMedia(couple, id)]);
  if (!memory) notFound();
  return <><Link className="quiet-link" href="/space/memories">← Our memories</Link><article className="private-paper">
    <p className="eyebrow">{memory.isMilestone ? "A CHAPTER IN OUR STORY" : "A MOMENT WE KEPT"}</p>
    <h1>{memory.title}</h1><time dateTime={memory.happenedOn}>{memory.happenedOn}</time>
    {memory.location && <p>{memory.location}</p>}<div className="memory-body">{memory.body}</div>
    {media.length > 0 && <section className="memory-media" aria-label="Photos in this memory">{media.map((asset) => <img key={asset.id} src={`/api/media/${asset.id}`} alt={asset.alt} />)}</section>}
    <Link className="button" href={`/space/memories/${memory.id}/edit`}>Edit memory</Link>
  </article></>;
}
