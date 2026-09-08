ALTER TABLE "couples" ADD COLUMN "heart_photos" jsonb;
--> statement-breakpoint
UPDATE "couples"
SET "heart_photos" = jsonb_build_array("heart_photo")
WHERE "heart_photo" IS NOT NULL;
