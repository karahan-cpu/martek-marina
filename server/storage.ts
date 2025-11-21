// Database storage for Supabase Auth and marina application
import {
  users,
  marinas,
  pedestals,
  bookings,
  serviceRequests,
  verificationAttempts,
  type User,
  type InsertUser,
  type Marina,
  type InsertMarina,
  type Pedestal,
  type InsertPedestal,
  type Booking,
  type InsertBooking,
  type ServiceRequest,
  type InsertServiceRequest,
  type VerificationAttempt,
  type InsertVerificationAttempt,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Supabase Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, update: Partial<User>): Promise<User | undefined>;

  // Marina operations
  getMarinas(): Promise<Marina[]>;
  getMarina(id: string): Promise<Marina | undefined>;
  createMarina(marina: InsertMarina): Promise<Marina>;
  updateMarina(id: string, marina: Partial<InsertMarina>): Promise<Marina | undefined>;

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

  // Verification attempt operations (for rate limiting)
  getVerificationAttempt(userId: string, pedestalId: string): Promise<VerificationAttempt | undefined>;
  upsertVerificationAttempt(attempt: InsertVerificationAttempt): Promise<VerificationAttempt>;
  deleteVerificationAttempt(userId: string, pedestalId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Supabase Auth)
  async getUser(id: string): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not initialized");
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
    if (!db) return [];
    return await db.select().from(users);
  }

  async updateUser(id: string, update: Partial<User>): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Marina operations
  async getMarinas(): Promise<Marina[]> {
    if (!db) return [];
    return await db.select().from(marinas);
  }

  async getMarina(id: string): Promise<Marina | undefined> {
    if (!db) return undefined;
    const [marina] = await db.select().from(marinas).where(eq(marinas.id, id));
    return marina;
  }

  async createMarina(insertMarina: InsertMarina): Promise<Marina> {
    if (!db) throw new Error("Database not initialized");
    const [marina] = await db.insert(marinas).values(insertMarina).returning();
    return marina;
  }

  async updateMarina(id: string, update: Partial<InsertMarina>): Promise<Marina | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [marina] = await db
      .update(marinas)
      .set(update)
      .where(eq(marinas.id, id))
      .returning();
    return marina;
  }

  // Pedestal operations
  async getPedestals(): Promise<Pedestal[]> {
    if (!db) return [];
    return await db.select().from(pedestals);
  }

  async getPedestal(id: string): Promise<Pedestal | undefined> {
    if (!db) return undefined;
    const [pedestal] = await db.select().from(pedestals).where(eq(pedestals.id, id));
    return pedestal;
  }

  async getPedestalByAccessCode(accessCode: string): Promise<Pedestal | undefined> {
    if (!db) return undefined;
    const [pedestal] = await db.select().from(pedestals).where(eq(pedestals.accessCode, accessCode));
    return pedestal;
  }

  async createPedestal(insertPedestal: InsertPedestal): Promise<Pedestal> {
    if (!db) throw new Error("Database not initialized");
    const [pedestal] = await db.insert(pedestals).values(insertPedestal).returning();
    return pedestal;
  }

  async updatePedestal(id: string, update: Partial<InsertPedestal>): Promise<Pedestal | undefined> {
    if (!db) throw new Error("Database not initialized");
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
    if (!db) return [];
    return await db.select().from(bookings);
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    if (!db) return undefined;
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    if (!db) throw new Error("Database not initialized");
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: string, update: Partial<InsertBooking>): Promise<Booking | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [booking] = await db
      .update(bookings)
      .set(update)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Service request operations
  async getServiceRequests(): Promise<ServiceRequest[]> {
    if (!db) return [];
    return await db.select().from(serviceRequests);
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    if (!db) return undefined;
    const [request] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return request;
  }

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    if (!db) throw new Error("Database not initialized");
    const [request] = await db.insert(serviceRequests).values(insertRequest).returning();
    return request;
  }

  async updateServiceRequest(id: string, update: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [request] = await db
      .update(serviceRequests)
      .set(update)
      .where(eq(serviceRequests.id, id))
      .returning();
    return request;
  }

  // Verification attempt operations (for rate limiting)
  async getVerificationAttempt(userId: string, pedestalId: string): Promise<VerificationAttempt | undefined> {
    if (!db) return undefined;
    const [attempt] = await db
      .select()
      .from(verificationAttempts)
      .where(
        and(
          eq(verificationAttempts.userId, userId),
          eq(verificationAttempts.pedestalId, pedestalId)
        )
      );
    return attempt;
  }

  async upsertVerificationAttempt(attemptData: InsertVerificationAttempt): Promise<VerificationAttempt> {
    if (!db) throw new Error("Database not initialized");
    const existing = await this.getVerificationAttempt(attemptData.userId, attemptData.pedestalId);

    if (existing) {
      // Update existing record
      const [updated] = await db
        .update(verificationAttempts)
        .set({
          totalFailed: attemptData.totalFailed,
          lockoutUntil: attemptData.lockoutUntil,
          lastAttempt: new Date(),
        })
        .where(
          and(
            eq(verificationAttempts.userId, attemptData.userId),
            eq(verificationAttempts.pedestalId, attemptData.pedestalId)
          )
        )
        .returning();
      return updated;
    } else {
      // Insert new record
      const [created] = await db
        .insert(verificationAttempts)
        .values(attemptData)
        .returning();
      return created;
    }
  }

  async deleteVerificationAttempt(userId: string, pedestalId: string): Promise<void> {
    if (!db) return;
    await db
      .delete(verificationAttempts)
      .where(
        and(
          eq(verificationAttempts.userId, userId),
          eq(verificationAttempts.pedestalId, pedestalId)
        )
      );
  }
}

export const storage = new DatabaseStorage();
