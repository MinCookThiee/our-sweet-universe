import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import type { UploadApiResponse } from "cloudinary";
import { coupleMembers, couples, mediaAssets, memoryMedia } from "./db/schema";
import { getCloudinary } from "./cloudinary";
import { getDb } from "./db";
import { imageFormat, MAX_MEMORY_IMAGE_BYTES } from "./media-input";

export type MediaActor = { coupleId: string; userId: string };
export type MediaAsset = typeof mediaAssets.$inferSelect;

export const mediaPublicId = (id: string) => `memory_assets/${id}`;

export function mediaConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export async function listMediaAssets(actor: MediaActor) {
  return getDb()
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.coupleId, actor.coupleId))
    .orderBy(desc(mediaAssets.createdAt))
    .limit(60);
}

export async function findMediaAsset(actor: MediaActor, id: string) {
  const [asset] = await getDb()
    .select()
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.id, id),
        eq(mediaAssets.coupleId, actor.coupleId),
        sql`exists(select 1 from ${coupleMembers} where ${coupleMembers.coupleId}=${mediaAssets.coupleId} and ${coupleMembers.userId}=${actor.userId})`,
      ),
    )
    .limit(1);
  return asset ?? null;
}

export async function listMemoryMedia(actor: MediaActor, memoryId: string) {
  return getDb()
    .select({
      id: mediaAssets.id,
      resourceType: mediaAssets.resourceType,
      format: mediaAssets.format,
      width: mediaAssets.width,
      height: mediaAssets.height,
      alt: memoryMedia.alt,
      position: memoryMedia.position,
    })
    .from(memoryMedia)
    .innerJoin(mediaAssets, eq(memoryMedia.assetId, mediaAssets.id))
    .where(
      and(
        eq(memoryMedia.memoryId, memoryId),
        eq(memoryMedia.coupleId, actor.coupleId),
        sql`exists(select 1 from ${coupleMembers} where ${coupleMembers.coupleId}=${memoryMedia.coupleId} and ${coupleMembers.userId}=${actor.userId})`,
      ),
    )
    .orderBy(memoryMedia.position);
}

export async function uploadMemoryImage(actor: MediaActor, bytes: Uint8Array) {
  if (!mediaConfigured()) throw new Error("media-not-configured");
  const id = randomUUID();
  // The same short cooldown protects a couple from accidental repeated taps on
  // slow mobile connections. It is enforced in SQL across server instances.
  const allowed = await getDb().execute(sql`
    update ${couples} set photo_upload_at=now()
    where ${couples.id}=${actor.coupleId}::uuid
      and (photo_upload_at is null or photo_upload_at < now() - interval '3 seconds')
      and exists(select 1 from ${coupleMembers} where ${coupleMembers.coupleId}=${couples.id} and ${coupleMembers.userId}=${actor.userId})
    returning id
  `);
  if (!allowed.rows.length) throw new Error("upload-rate-limit");

  let result: UploadApiResponse;
  try {
    result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = getCloudinary().uploader.upload_stream(
        {
          public_id: mediaPublicId(id),
          resource_type: "image",
          type: "authenticated",
          overwrite: false,
          allowed_formats: ["jpg", "png", "webp"],
          transformation: [
            { width: 2400, height: 2400, crop: "limit" },
            { flags: "strip_profile" },
          ],
          timeout: 60000,
        },
        (error, uploaded) =>
          error || !uploaded
            ? reject(new Error("upload-failed"))
            : resolve(uploaded),
      );
      stream.on("error", () => reject(new Error("upload-failed")));
      stream.end(Buffer.from(bytes));
    });
  } catch {
    throw new Error("upload-failed");
  }

  const format = imageFormat(`image/${result.format === "jpg" ? "jpeg" : result.format}`);
  if (
    result.public_id !== mediaPublicId(id) ||
    result.type !== "authenticated" ||
    result.resource_type !== "image" ||
    !format ||
    !result.width ||
    !result.height ||
    result.width > 2400 ||
    result.height > 2400 ||
    !Number.isInteger(result.bytes) ||
    result.bytes < 1 ||
    result.bytes > MAX_MEMORY_IMAGE_BYTES
  ) {
    await getCloudinary().uploader
      .destroy(mediaPublicId(id), {
        resource_type: "image",
        type: "authenticated",
        invalidate: true,
      })
      .catch(() => undefined);
    throw new Error("invalid-provider-result");
  }

  try {
    const [asset] = await getDb()
      .insert(mediaAssets)
      .values({
        id,
        coupleId: actor.coupleId,
        createdBy: actor.userId,
        publicId: mediaPublicId(id),
        resourceType: "image",
        deliveryType: "authenticated",
        format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      })
      .returning();
    return asset;
  } catch {
    await getCloudinary().uploader
      .destroy(mediaPublicId(id), {
        resource_type: "image",
        type: "authenticated",
        invalidate: true,
      })
      .catch(() => undefined);
    throw new Error("save-failed");
  }
}
