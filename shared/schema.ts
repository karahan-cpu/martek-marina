import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table - Simplified for Supabase Auth
// Supabase handles authentication, this table is for additional app-specific user data
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Supabase user ID
  email: varchar("email").unique().notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

// Premium marinas managed by Martek
export const marinas = pgTable("marinas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  amenities: text("amenities").array().notNull(),
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
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  pedestalId: varchar("pedestal_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  needsWater: boolean("needs_water").notNull().default(true),
  needsElectricity: boolean("needs_electricity").notNull().default(true),
  status: text("status").notNull(), // "pending", "confirmed", "active", "completed", "cancelled"
  estimatedCost: integer("estimated_cost").notNull(), // in cents
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users);

export const insertMarinaSchema = createInsertSchema(marinas).omit({
  id: true,
});

export const insertPedestalSchema = createInsertSchema(pedestals).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
}).extend({
  startDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  endDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMarina = z.infer<typeof insertMarinaSchema>;
export type Marina = typeof marinas.$inferSelect;

export type InsertPedestal = z.infer<typeof insertPedestalSchema>;
export type Pedestal = typeof pedestals.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
