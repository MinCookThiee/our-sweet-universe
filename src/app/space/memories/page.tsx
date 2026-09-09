import Link from "next/link";
import { MemoryList } from "@/components/memory-list";
import { pageNumber } from "@/lib/memory-input";

export default async function MemoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <>
    <div className="private-heading">
      <div><p className="eyebrow">THE DAYS WE KEEP</p><h1>Our memories.</h1><p className="memory-page-intro">Little days, lovely details, all kept close.</p></div>
      <Link className="button" href="/space/memories/new">+ Keep a memory</Link>
    </div>
    <MemoryList page={pageNumber((await searchParams).page)} />
  </>;
}
