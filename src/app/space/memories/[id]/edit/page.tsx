import { notFound } from "next/navigation";
import { findMemory } from "@/lib/memories";
import { MemoryForm } from "@/components/memory-form";
export default async function EditMemory({params}: {params:Promise<{id:string}>}) {
  const memory = await findMemory((await params).id);
  if (!memory) notFound();
  return <><p className="eyebrow">OUR MEMORIES</p><h1>A little more to remember.</h1><MemoryForm mode="edit" memory={{id:memory.id,title:memory.title,body:memory.body,happenedOn:memory.happenedOn,location:memory.location,isMilestone:memory.isMilestone}} /></>;
}
