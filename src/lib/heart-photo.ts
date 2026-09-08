import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, lt, sql } from "drizzle-orm";
import type { UploadApiResponse } from "cloudinary";
import { getAuth, authConfigured } from "./auth";
import { getDb } from "./db";
import { coupleMembers, couples, heartPhotoUploads } from "./db/schema";
import { getCloudinary } from "./cloudinary";
import { defaultCrop, MAX_HEART_PHOTOS, type SavedHeartPhoto } from "./heart-photo-input";

export async function photoActor(headers: Headers) {
  if (!authConfigured()) return null;
  const session = await getAuth().api.getSession({ headers });
  if (!session) return null;
  const [actor] = await getDb().select({ coupleId: couples.id, photos: couples.heartPhotos, legacyPhoto: couples.heartPhoto, revision: couples.photoRevision })
    .from(couples).innerJoin(coupleMembers, eq(coupleMembers.coupleId, couples.id))
    .where(eq(coupleMembers.userId, session.user.id)).limit(1);
  return actor ? { ...actor, photos: actor.photos ?? (actor.legacyPhoto ? [actor.legacyPhoto] : []), userId: session.user.id } : null;
}
export type PhotoActor = NonNullable<Awaited<ReturnType<typeof photoActor>>>;
export function photoScope(actor: Pick<PhotoActor, "coupleId" | "userId">, revision: number) {
  return and(eq(couples.id, actor.coupleId), eq(couples.photoRevision, revision),
    sql`exists(select 1 from ${coupleMembers} where ${coupleMembers.coupleId}=${couples.id} and ${coupleMembers.userId}=${actor.userId})`);
}
export const publicIdFor = (id: string) => `heart_photos/${id}`;
export function photoConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}
export async function uploadHeartPhoto(actor: PhotoActor, bytes: Uint8Array) {
  const id = randomUUID();
  // Durable intent also bounds per-couple upload attempts across server instances.
  const inserted = await getDb().execute(sql`with allowed as (
    update ${couples} set photo_upload_at=now()
    where ${couples.id}=${actor.coupleId}::uuid
      and (photo_upload_at is null or photo_upload_at < now() - interval '10 seconds')
      and (select count(*) from ${heartPhotoUploads} where ${heartPhotoUploads.coupleId}=${actor.coupleId}::uuid and ${heartPhotoUploads.createdAt} > now() - interval '1 hour') < 20
      and exists(select 1 from ${coupleMembers} where ${coupleMembers.coupleId}=${couples.id} and ${coupleMembers.userId}=${actor.userId})
    returning id
  ) insert into ${heartPhotoUploads} (id,couple_id) select ${id}::uuid,id from allowed returning id`);
  if (!inserted.rows.length) throw new Error("upload-rate-limit");
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream({
      public_id: publicIdFor(id), resource_type: "image", type: "authenticated",
      overwrite: false, allowed_formats: ["jpg", "png", "webp"], format: "jpg",
      transformation: [{ width: 1600, height: 1600, crop: "limit" }, { flags: "strip_profile" }],
      timeout: 45000,
    }, (error, uploaded) => error || !uploaded ? reject(new Error("upload-failed")) : resolve(uploaded));
    stream.on("error", () => reject(new Error("upload-failed")));
    stream.end(Buffer.from(bytes));
  });
  const format = result.format === "jpg" || result.format === "png" || result.format === "webp" ? result.format : null;
  if (result.public_id !== publicIdFor(id) || result.type !== "authenticated" || result.resource_type !== "image" || !format || !result.width || !result.height || result.width > 1600 || result.height > 1600 || result.bytes > 8 * 1024 * 1024)
    throw new Error("invalid-provider-result");
  return { id, width: result.width, height: result.height, format, crop: defaultCrop } satisfies SavedHeartPhoto;
}
export async function saveHeartPhotos(actor: PhotoActor, revision: number, photos: SavedHeartPhoto[], newUploadId?: string) {
  if (photos.length > MAX_HEART_PHOTOS) return undefined;
  const [updated] = await getDb().update(couples).set({ heartPhotos: photos, heartPhoto: null, photoRevision: sql`${couples.photoRevision} + 1` })
    .where(and(photoScope(actor, revision), newUploadId ? sql`exists(select 1 from ${heartPhotoUploads} where ${heartPhotoUploads.id}=${newUploadId}::uuid and ${heartPhotoUploads.coupleId}=${actor.coupleId}::uuid and ${heartPhotoUploads.createdAt} > now() - interval '30 minutes')` : undefined))
    .returning({ revision: couples.photoRevision });
  return updated;
}
// Called after replacement/removal and by the maintenance command. Only old,
// unreferenced intents qualify; finalization expires well before this window.
export async function cleanupHeartPhotos(retiredId?: string) {
  const db = getDb();
  const candidates = await db.select({ id: heartPhotoUploads.id }).from(heartPhotoUploads)
    .where(and(retiredId ? eq(heartPhotoUploads.id, retiredId) : lt(heartPhotoUploads.createdAt, new Date(Date.now() - 60 * 60 * 1000)),
      sql`not exists(select 1 from ${couples} where ${couples.heartPhotos} @> jsonb_build_array(jsonb_build_object('id', ${heartPhotoUploads.id}::text)) or ${couples.heartPhoto}->>'id'=${heartPhotoUploads.id}::text)`)).limit(2);
  let removed = 0;
  for (const { id } of candidates) {
    try {
      const options = { resource_type: "image" as const, type: "authenticated" as const, invalidate: true, timeout: 5000 };
      const result = await getCloudinary().uploader.destroy(publicIdFor(id), options);
      if (result.result !== "ok" && result.result !== "not found") continue;
      // Keep recent intents for the hourly rate-limit count, even after the
      // remote asset is gone. Later cleanup receives "not found" and prunes them.
      await db.delete(heartPhotoUploads).where(and(eq(heartPhotoUploads.id, id), lt(heartPhotoUploads.createdAt, new Date(Date.now() - 60 * 60 * 1000)))); removed++;
    } catch { /* Keep the intent for a later retry. Never log provider errors. */ }
  }
  return removed;
}

// Keep existing private pages usable while this additive migration is awaiting
// application. Only missing-schema errors receive the setup fallback.
export async function readHeartPhoto(actor: {coupleId:string;userId:string}) {
  try {
    const [row] = await getDb().select({photos:couples.heartPhotos,legacyPhoto:couples.heartPhoto,revision:couples.photoRevision}).from(couples)
      .where(and(eq(couples.id,actor.coupleId),sql`exists(select 1 from ${coupleMembers} where ${coupleMembers.coupleId}=${couples.id} and ${coupleMembers.userId}=${actor.userId})`)).limit(1);
    return {photos:row?.photos ?? (row?.legacyPhoto ? [row.legacyPhoto] : []),revision:row?.revision ?? 0,ready:Boolean(row)};
  } catch(error) {
    const code = (error as {code?:string;cause?:{code?:string}})?.cause?.code ?? (error as {code?:string})?.code;
    if (code === "42703" || code === "42P01") return {photo:null,revision:0,ready:false};
    throw error;
  }
}
