ALTER TABLE "couples" ADD COLUMN "card_text" jsonb;--> statement-breakpoint
ALTER TABLE "couples" ADD COLUMN "card_revision" integer DEFAULT 0 NOT NULL;