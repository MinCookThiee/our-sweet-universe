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
      <div><p className="eyebrow">THE DAYS WE KEEP</p><h1>Our memories.</h1></div>
      <Link className="button" href="/space/memories/new">+ Add memory</Link>
    </div>
    <MemoryList page={pageNumber((await searchParams).page)} />
  </>;
}
