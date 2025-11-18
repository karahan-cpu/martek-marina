// Database storage for Supabase Auth and marina application
import {
  users,
  pedestals,
  bookings,
  serviceRequests,
  type User,
  type InsertUser,
  type Pedestal,
  type InsertPedestal,
  type Booking,
  type InsertBooking,
  type ServiceRequest,
  type InsertServiceRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Supabase Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, update: Partial<User>): Promise<User | undefined>;

  // Pedestal operations
  getPedestals(): Promise<Pedestal[]>;
  getPedestal(id: string): Promise<Pedestal | undefined>;
  createPedestal(pedestal: InsertPedestal): Promise<Pedestal>;
  updatePedestal(id: string, pedestal: Partial<InsertPedestal>): Promise<Pedestal | undefined>;

  // Booking operations
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined>;

  // Service request operations
  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequest(id: string): Promise<ServiceRequest | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: string, request: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Supabase Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, update: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Pedestal operations
  async getPedestals(): Promise<Pedestal[]> {
    return await db.select().from(pedestals);
  }

  async getPedestal(id: string): Promise<Pedestal | undefined> {
    const [pedestal] = await db.select().from(pedestals).where(eq(pedestals.id, id));
    return pedestal;
  }

  async createPedestal(insertPedestal: InsertPedestal): Promise<Pedestal> {
    const [pedestal] = await db.insert(pedestals).values(insertPedestal).returning();
    return pedestal;
  }

  async updatePedestal(id: string, update: Partial<InsertPedestal>): Promise<Pedestal | undefined> {
    // Defense in depth: Filter out immutable/sensitive fields that should never be updated
    const { accessCode, berthNumber, id: pedestalId, ...safeUpdate } = update as any;
    
    if (Object.keys(safeUpdate).length === 0) {
      // If no valid fields to update, just return current pedestal
      return this.getPedestal(id);
    }
    
    const [pedestal] = await db
      .update(pedestals)
      .set(safeUpdate)
      .where(eq(pedestals.id, id))
      .returning();
    return pedestal;
  }

  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: string, update: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set(update)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Service request operations
  async getServiceRequests(): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests);
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    const [request] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return request;
  }

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const [request] = await db.insert(serviceRequests).values(insertRequest).returning();
    return request;
  }

  async updateServiceRequest(id: string, update: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined> {
    const [request] = await db
      .update(serviceRequests)
      .set(update)
      .where(eq(serviceRequests.id, id))
      .returning();
    return request;
  }
}

export const storage = new DatabaseStorage();
