import Link from "next/link";
import { requireCouple } from "@/lib/authorization";
import { anniversaryStats, calendarDate } from "@/lib/dates";
import { pageNumber } from "@/lib/memory-input";
import { MemoryList } from "@/components/memory-list";
export default async function Space({searchParams}: {searchParams: Promise<{page?:string}>}) {
  const couple = await requireCouple();
  const stats = anniversaryStats(couple.togetherSince, calendarDate(new Date(),couple.timezone));
  return <>
    <section className="private-welcome"><p className="eyebrow">OUR SWEET UNIVERSE</p><h1>Our days, kept close.</h1><p>A place for everything that feels like us.</p>
      <div className="private-stats"><span><strong>{stats.daysTogether.toLocaleString()}</strong> days together</span><span><strong>{stats.daysUntil === 0 ? "Today ♡" : stats.daysUntil}</strong> {stats.daysUntil === 0 ? "Happy anniversary!" : "days to our anniversary"}</span></div>
    </section>
    <div className="private-heading"><h2>Our memories</h2><Link className="button" href="/space/memories/new">+ Add memory</Link></div>
    <MemoryList page={pageNumber((await searchParams).page)} />
  </>;
}
