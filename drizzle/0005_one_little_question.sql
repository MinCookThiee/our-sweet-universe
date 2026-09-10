CREATE TABLE "little_question_bank" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "prompt" text NOT NULL,
  "category" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "little_question_bank_prompt_unique" UNIQUE("prompt")
);
--> statement-breakpoint
CREATE TABLE "little_question_rounds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "couple_id" uuid NOT NULL,
  "question_id" uuid NOT NULL,
  "question_day" date NOT NULL,
  "status" text DEFAULT 'answering' NOT NULL,
  "rest_requested_by" text,
  "rest_requested_at" timestamp with time zone,
  "revealed_at" timestamp with time zone,
  "rested_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "little_question_round_couple_day_unique" UNIQUE("couple_id","question_day"),
  CONSTRAINT "little_question_round_status" CHECK ("little_question_rounds"."status" in ('answering', 'decision', 'rest_requested', 'revealed', 'rested'))
);
--> statement-breakpoint
CREATE TABLE "little_question_answers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "round_id" uuid NOT NULL,
  "user_id" text NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "little_question_answer_round_user_unique" UNIQUE("round_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "little_question_rounds" ADD CONSTRAINT "little_question_rounds_couple_id_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "little_question_rounds" ADD CONSTRAINT "little_question_rounds_question_id_little_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."little_question_bank"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "little_question_rounds" ADD CONSTRAINT "little_question_rounds_rest_requested_by_user_id_fk" FOREIGN KEY ("rest_requested_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "little_question_answers" ADD CONSTRAINT "little_question_answers_round_id_little_question_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."little_question_rounds"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "little_question_answers" ADD CONSTRAINT "little_question_answers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "little_question_bank_active_idx" ON "little_question_bank" USING btree ("is_active","sort_order");
--> statement-breakpoint
CREATE INDEX "little_question_rounds_couple_day_idx" ON "little_question_rounds" USING btree ("couple_id","question_day");
--> statement-breakpoint
CREATE INDEX "little_question_answers_round_idx" ON "little_question_answers" USING btree ("round_id");
