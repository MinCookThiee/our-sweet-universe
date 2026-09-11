import { readHeartPhoto, photoConfigured } from "@/lib/heart-photo";
import { requireCouple } from "@/lib/authorization";
import { calendarDate } from "@/lib/dates";
import { defaultCardText } from "@/lib/card-text";
import { EditableCoupleCard } from "@/components/editable-couple-card";
import { HomeWidgets } from "@/components/home-widgets";
import { homeMemorySnapshot } from "@/lib/memories";
import { normalizeHomeWidgets } from "@/lib/home-widgets";
export default async function Space() {
  const couple = await requireCouple();
  const heart = await readHeartPhoto(couple);
  const snapshot = await homeMemorySnapshot();

  return <section className="space-home">
    <EditableCoupleCard key={`${couple.cardRevision}-${heart.revision}`} photos={heart.photos ?? []} photoRevision={heart.revision} photoReady={heart.ready} uploadsEnabled={photoConfigured()} revision={couple.cardRevision} text={couple.cardText ?? defaultCardText} name={couple.name} togetherSince={couple.togetherSince} timezone={couple.timezone} initialToday={calendarDate(new Date(),couple.timezone)} />
    <HomeWidgets config={normalizeHomeWidgets(couple.homeWidgets)} latest={snapshot.latest} milestone={snapshot.milestone} memoryCount={snapshot.total} favoriteCoverSrc={snapshot.favoriteCoverId ? `/api/media/${snapshot.favoriteCoverId}` : undefined} galleryPhotoSrcs={snapshot.galleryPhotoIds.map((id) => `/api/media/${id}`)} heartPhotoSrc={heart.photos?.[0] ? `/api/heart-photo/${heart.photos[0].id}` : undefined} />
  </section>;
}
