import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
