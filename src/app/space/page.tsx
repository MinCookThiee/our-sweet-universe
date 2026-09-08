import { readHeartPhoto, photoConfigured } from "@/lib/heart-photo";
import Link from "next/link";
import { requireCouple } from "@/lib/authorization";
import { calendarDate } from "@/lib/dates";
import { pageNumber } from "@/lib/memory-input";
import { MemoryList } from "@/components/memory-list";
import { defaultCardText } from "@/lib/card-text";
import { EditableCoupleCard } from "@/components/editable-couple-card";
export default async function Space({searchParams}: {searchParams: Promise<{page?:string}>}) {
  const couple = await requireCouple();
  const heart = await readHeartPhoto(couple);

  return <>
    <EditableCoupleCard key={`${couple.cardRevision}-${heart.revision}`} photos={heart.photos ?? []} photoRevision={heart.revision} photoReady={heart.ready} uploadsEnabled={photoConfigured()} revision={couple.cardRevision} text={couple.cardText ?? defaultCardText} name={couple.name} togetherSince={couple.togetherSince} timezone={couple.timezone} initialToday={calendarDate(new Date(),couple.timezone)} />
    <div className="private-heading"><h2>Our memories</h2><Link className="button" href="/space/memories/new">+ Add memory</Link></div>
    <MemoryList page={pageNumber((await searchParams).page)} />
  </>;
}
