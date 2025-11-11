import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  boatName: text("boat_name"),
  boatType: text("boat_type"),
  boatLength: text("boat_length"),
  boatRegistration: text("boat_registration"),
});

export const pedestals = pgTable("pedestals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  berthNumber: text("berth_number").notNull().unique(),
  status: text("status").notNull(), // "available", "occupied", "maintenance", "offline"
  waterEnabled: boolean("water_enabled").notNull().default(false),
  electricityEnabled: boolean("electricity_enabled").notNull().default(false),
  waterUsage: integer("water_usage").notNull().default(0), // liters
  electricityUsage: integer("electricity_usage").notNull().default(0), // kWh
  currentUserId: varchar("current_user_id"),
  locationX: integer("location_x").notNull(), // for map visualization
  locationY: integer("location_y").notNull(),
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
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPedestalSchema = createInsertSchema(pedestals).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPedestal = z.infer<typeof insertPedestalSchema>;
export type Pedestal = typeof pedestals.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
