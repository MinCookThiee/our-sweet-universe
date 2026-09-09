import { randomUUID } from "node:crypto";
import { requireCouple } from "@/lib/authorization";
import { calendarDate } from "@/lib/dates";
import { listMediaAssets } from "@/lib/media";
import { MemoryForm } from "@/components/memory-form";
export default async function NewMemory() {
  const couple = await requireCouple();
  const assets = await listMediaAssets(couple);
  return <><p className="eyebrow">A MOMENT FOR US</p><h1>Keep a memory.</h1><p>It doesn’t have to be a big day to matter.</p><MemoryForm mode="create" assets={assets} memory={{id:randomUUID(),title:"",body:"",location:"",isMilestone:false,happenedOn:calendarDate(new Date(),couple.timezone)}} /></>;
}
