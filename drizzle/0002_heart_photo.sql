CREATE TABLE "heart_photo_uploads" (
	"id" uuid PRIMARY KEY NOT NULL,
	"couple_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "couples" ADD COLUMN "photo_upload_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "couples" ADD COLUMN "heart_photo" jsonb;--> statement-breakpoint
ALTER TABLE "couples" ADD COLUMN "photo_revision" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "heart_photo_uploads" ADD CONSTRAINT "heart_photo_uploads_couple_id_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "heart_photo_uploads_created_idx" ON "heart_photo_uploads" USING btree ("created_at");