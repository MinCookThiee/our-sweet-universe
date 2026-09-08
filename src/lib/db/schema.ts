import type { SavedHeartPhoto } from "../heart-photo-input";
import {
  pgTable,
  jsonb,
  text,
  timestamp,
  boolean,
  uuid,
  date,
  integer,
  primaryKey,
  index,
  unique,
  foreignKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();
// Better Auth owns these tables. Only the local bootstrap script inserts an
// initial credential, using Better Auth’s own password hashing implementation.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("account_user_idx").on(t.userId),
    unique("account_provider_unique").on(t.providerId, t.accountId),
  ],
);
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);
export const couples = pgTable("couples", {
  photoUploadAt: timestamp("photo_upload_at", { withTimezone: true }),
  heartPhoto: jsonb("heart_photo").$type<SavedHeartPhoto>(),
  photoRevision: integer("photo_revision").default(0).notNull(),
  cardText: jsonb("card_text").$type<{ribbon:string;heading:string;message:string}>(),
  cardRevision: integer("card_revision").default(0).notNull(),
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  togetherSince: date("together_since").notNull(),
  timezone: text("timezone").default("Asia/Bangkok").notNull(),
  createdAt: createdAt(),
});
export const coupleMembers = pgTable(
  "couple_members",
  {
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "partner"] }).notNull(),
    joinedAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.coupleId, t.userId] }),
    unique("one_couple_per_user").on(t.userId),
    check("member_role", sql`${t.role} in ('owner', 'partner')`),
  ],
);
export const memories = pgTable(
  "memories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    happenedOn: date("happened_on").notNull(),
    location: text("location"),
    isMilestone: boolean("is_milestone").default(false).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("memories_couple_date_idx").on(t.coupleId, t.happenedOn),
    unique("memory_couple_unique").on(t.id, t.coupleId),
  ],
);
export const memoryMedia = pgTable(
  "memory_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    memoryId: uuid("memory_id").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    publicId: text("public_id").notNull().unique(),
    resourceType: text("resource_type", { enum: ["image", "video"] }).notNull(),
    deliveryType: text("delivery_type").default("authenticated").notNull(),
    alt: text("alt").notNull(),
    position: integer("position").default(0).notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    foreignKey({
      columns: [t.memoryId, t.coupleId],
      foreignColumns: [memories.id, memories.coupleId],
    }).onDelete("cascade"),
    index("media_couple_idx").on(t.coupleId),
    check("authenticated_media_only", sql`${t.deliveryType} = 'authenticated'`),
    check("media_resource_type", sql`${t.resourceType} in ('image', 'video')`),
  ],
);
export const letters = pgTable(
  "letters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("letters_couple_idx").on(t.coupleId)],
);
export const jarNotes = pgTable(
  "jar_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("jar_couple_idx").on(t.coupleId)],
);

// Upload intent is persisted BEFORE contacting Cloudinary. Unreferenced rows
// survive request failures so cleanup can retry without logging private URLs.
export const heartPhotoUploads = pgTable("heart_photo_uploads", {
  id: uuid("id").primaryKey(),
  coupleId: uuid("couple_id").notNull().references(() => couples.id),
  createdAt: createdAt(),
}, (t) => [index("heart_photo_uploads_created_idx").on(t.createdAt)]);
