CREATE TABLE "media_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "couple_id" uuid NOT NULL,
  "created_by" text NOT NULL,
  "public_id" text NOT NULL,
  "resource_type" text NOT NULL,
  "delivery_type" text DEFAULT 'authenticated' NOT NULL,
  "format" text NOT NULL,
  "bytes" integer NOT NULL,
  "width" integer,
  "height" integer,
  "duration_ms" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "media_assets_public_id_unique" UNIQUE("public_id"),
  CONSTRAINT "media_asset_couple_unique" UNIQUE("id","couple_id"),
  CONSTRAINT "media_assets_authenticated_only" CHECK ("media_assets"."delivery_type" = 'authenticated'),
  CONSTRAINT "media_assets_resource_type" CHECK ("media_assets"."resource_type" in ('image', 'video'))
);
--> statement-breakpoint
ALTER TABLE "memory_media" RENAME COLUMN "created_by" TO "attached_by";
--> statement-breakpoint
ALTER TABLE "memory_media" ADD COLUMN "asset_id" uuid;
--> statement-breakpoint
-- Existing rows are promoted to library assets before their old columns go
-- away. The app never exposed memory uploads before this migration, but this
-- preserves any manually inserted records as well.
INSERT INTO "media_assets" ("id", "couple_id", "created_by", "public_id", "resource_type", "delivery_type", "format", "bytes", "created_at")
SELECT "id", "couple_id", "attached_by", "public_id", "resource_type", "delivery_type", 'jpg', 0, "created_at"
FROM "memory_media";
--> statement-breakpoint
UPDATE "memory_media" SET "asset_id" = "id" WHERE "asset_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "memory_media" ALTER COLUMN "asset_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "memory_media" DROP CONSTRAINT "memory_media_public_id_unique";
--> statement-breakpoint
ALTER TABLE "memory_media" DROP CONSTRAINT "authenticated_media_only";
--> statement-breakpoint
ALTER TABLE "memory_media" DROP CONSTRAINT "media_resource_type";
--> statement-breakpoint
ALTER TABLE "memory_media" DROP CONSTRAINT "memory_media_created_by_user_id_fk";
--> statement-breakpoint
DROP INDEX "media_couple_idx";
--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_couple_id_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "media_assets_couple_created_idx" ON "media_assets" USING btree ("couple_id","created_at");
--> statement-breakpoint
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_attached_by_user_id_fk" FOREIGN KEY ("attached_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_asset_id_couple_id_media_assets_id_couple_id_fk" FOREIGN KEY ("asset_id","couple_id") REFERENCES "public"."media_assets"("id","couple_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "memory_media_memory_position_idx" ON "memory_media" USING btree ("memory_id","position");
--> statement-breakpoint
ALTER TABLE "memory_media" DROP COLUMN "public_id";
--> statement-breakpoint
ALTER TABLE "memory_media" DROP COLUMN "resource_type";
--> statement-breakpoint
ALTER TABLE "memory_media" DROP COLUMN "delivery_type";
--> statement-breakpoint
ALTER TABLE "memory_media" ADD CONSTRAINT "memory_media_memory_asset_unique" UNIQUE("memory_id","asset_id");
