import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table - Simplified for Supabase Auth
// Supabase handles authentication, this table is for additional app-specific user data
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Supabase user ID
  email: varchar("email").unique().notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  balance: integer("balance").notNull().default(0), // in cents/kurus
});

// Premium marinas managed by Martek
export const marinas = pgTable("marinas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  amenities: jsonb("amenities").notNull().$type<string[]>(),
  totalBerths: integer("total_berths").notNull(),
  imageUrl: text("image_url"),
  isPremium: boolean("is_premium").notNull().default(true),
});

export const pedestals = pgTable("pedestals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  marinaId: varchar("marina_id").notNull(), // Reference to marina
  berthNumber: text("berth_number").notNull().unique(),
  status: text("status").notNull(), // "available", "occupied", "maintenance", "offline"
  waterEnabled: boolean("water_enabled").notNull().default(false),
  electricityEnabled: boolean("electricity_enabled").notNull().default(false),
  waterUsage: integer("water_usage").notNull().default(0), // liters
  electricityUsage: integer("electricity_usage").notNull().default(0), // kWh
  currentUserId: varchar("current_user_id"),
  locationX: integer("location_x").notNull(), // for map visualization
  locationY: integer("location_y").notNull(),
  accessCode: varchar("access_code", { length: 8 }).notNull(), // 6-8 digit code for QR/manual unlock
  waterRate: integer("water_rate").notNull().default(50), // cents per minute
  electricityRate: integer("electricity_rate").notNull().default(100), // cents per minute
});

export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  pedestalId: varchar("pedestal_id"),
  requestType: text("request_type").notNull(), // "maintenance", "technical", "general"
  description: text("description").notNull(),
  urgency: text("urgency").notNull(), // "normal", "urgent"
  status: text("status").notNull(), // "pending", "in_progress", "resolved"
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Verification attempts tracking for rate limiting (prevent brute-force attacks)
export const verificationAttempts = pgTable("verification_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  pedestalId: varchar("pedestal_id").notNull(),
  totalFailed: integer("total_failed").notNull().default(0),
  lockoutUntil: timestamp("lockout_until"),
  firstAttempt: timestamp("first_attempt").notNull().default(sql`now()`),
  lastAttempt: timestamp("last_attempt").notNull().default(sql`now()`),
});

export const activeSessions = pgTable("active_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  pedestalId: varchar("pedestal_id").notNull(),
  serviceType: text("service_type").notNull(), // "water" or "electricity"
  startTime: timestamp("start_time").notNull().default(sql`now()`),
  lastUpdated: timestamp("last_updated").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);

export const insertMarinaSchema = createInsertSchema(marinas).omit({
  id: true,
}).extend({
  amenities: z.array(z.string()),
});

export const insertPedestalSchema = createInsertSchema(pedestals).omit({
  id: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationAttemptSchema = createInsertSchema(verificationAttempts).omit({
  id: true,
  firstAttempt: true,
  lastAttempt: true,
});

export const insertActiveSessionSchema = createInsertSchema(activeSessions).omit({
  id: true,
  startTime: true,
  lastUpdated: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMarina = z.infer<typeof insertMarinaSchema>;
export type Marina = typeof marinas.$inferSelect;

export type InsertPedestal = z.infer<typeof insertPedestalSchema>;
export type Pedestal = typeof pedestals.$inferSelect;

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;

export type InsertVerificationAttempt = z.infer<typeof insertVerificationAttemptSchema>;
export type VerificationAttempt = typeof verificationAttempts.$inferSelect;

export type InsertActiveSession = z.infer<typeof insertActiveSessionSchema>;
export type ActiveSession = typeof activeSessions.$inferSelect;
