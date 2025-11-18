import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMarinaSchema, insertPedestalSchema, insertBookingSchema, insertServiceRequestSchema } from "@shared/schema";
import { requireAuth } from "./supabaseAuth";
import { requireAdmin } from "./adminMiddleware";
import { z } from "zod";

// Schema for updating pedestal service controls - ONLY allow these fields
const updatePedestalServicesSchema = z.object({
  waterEnabled: z.boolean().optional(),
  electricityEnabled: z.boolean().optional(),
}).strict(); // Reject any extra fields

export async function registerRoutes(app: Express): Promise<Server> {
  // Store verified pedestal access in memory (in production, use Redis or database)
  const verifiedAccess = new Map<string, Set<string>>(); // userId -> Set of pedestalIds
  
  // Rate limiting for access code verification (prevent brute-force attacks)
  interface VerifyAttempt {
    count: number;
    lockoutUntil?: number;
    lastAttempt: number;
  }
  const verifyAttempts = new Map<string, VerifyAttempt>(); // "userId:pedestalId" -> attempt data
  const MAX_ATTEMPTS = 3; // Max failed attempts before lockout
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes lockout
  const ATTEMPT_WINDOW = 60 * 1000; // Reset counter after 1 minute of no attempts

  // Auth route - get logged in user
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let user = await storage.getUser(userId);
      
      // Create user if doesn't exist
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: req.user.email!,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Marina routes
  app.get("/api/marinas", requireAuth, async (_req, res) => {
    try {
      const marinas = await storage.getMarinas();
      res.json(marinas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch marinas" });
    }
  });

  app.get("/api/marinas/:id", requireAuth, async (req, res) => {
    try {
      const marina = await storage.getMarina(req.params.id);
      if (!marina) {
        return res.status(404).json({ error: "Marina not found" });
      }
      res.json(marina);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch marina" });
    }
  });

  app.post("/api/marinas", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertMarinaSchema.parse(req.body);
      const marina = await storage.createMarina(validatedData);
      res.status(201).json(marina);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid marina data" });
      }
      res.status(500).json({ error: "Failed to create marina" });
    }
  });

  app.patch("/api/marinas/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Validate marina update data
      const validatedData = insertMarinaSchema.partial().parse(req.body);
      
      const updated = await storage.updateMarina(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Marina not found" });
      }
      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid marina data" });
      }
      res.status(500).json({ error: "Failed to update marina" });
    }
  });

  app.get("/api/pedestals", requireAuth, async (_req, res) => {
    try {
      const pedestals = await storage.getPedestals();
      // Remove access codes from response for security
      const safePedestals = pedestals.map(({ accessCode, ...pedestal }) => pedestal);
      res.json(safePedestals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pedestals" });
    }
  });

  app.get("/api/pedestals/:id", requireAuth, async (req, res) => {
    try {
      const pedestal = await storage.getPedestal(req.params.id);
      if (!pedestal) {
        return res.status(404).json({ error: "Pedestal not found" });
      }
      // Remove access code from response for security
      const { accessCode, ...safePedestal } = pedestal;
      res.json(safePedestal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pedestal" });
    }
  });

  app.patch("/api/pedestals/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const pedestalId = req.params.id;
      
      // Check if user has verified access to this pedestal
      const hasAccess = verifiedAccess.get(userId)?.has(pedestalId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied. Please verify access code first." });
      }
      
      // Validate and whitelist only service control fields
      const validatedData = updatePedestalServicesSchema.parse(req.body);
      
      const updated = await storage.updatePedestal(pedestalId, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Pedestal not found" });
      }
      
      // Remove access code from response
      const { accessCode, ...safeUpdated } = updated;
      res.json(safeUpdated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid update data. Only water and electricity controls allowed." });
      }
      res.status(500).json({ error: "Failed to update pedestal" });
    }
  });

  app.post("/api/pedestals/:id/verify-access", requireAuth, async (req: any, res) => {
    try {
      const { accessCode } = req.body;
      const userId = req.user.id;
      const pedestalId = req.params.id;
      const attemptKey = `${userId}:${pedestalId}`;
      
      // Validate input
      if (!accessCode || typeof accessCode !== 'string' || accessCode.length !== 6) {
        return res.status(400).json({ error: "Invalid access code format" });
      }
      
      // Check rate limiting
      const now = Date.now();
      let attempt = verifyAttempts.get(attemptKey);
      
      if (attempt) {
        // Check if locked out
        if (attempt.lockoutUntil && now < attempt.lockoutUntil) {
          const remainingMinutes = Math.ceil((attempt.lockoutUntil - now) / 60000);
          console.warn(`[SECURITY] User ${userId} locked out for pedestal ${pedestalId}. ${remainingMinutes} minutes remaining.`);
          return res.status(429).json({ 
            error: `Too many failed attempts. Please try again in ${remainingMinutes} minute(s).` 
          });
        }
        
        // Reset counter if last attempt was more than ATTEMPT_WINDOW ago
        if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
          attempt = { count: 0, lastAttempt: now };
          verifyAttempts.set(attemptKey, attempt);
        }
      } else {
        attempt = { count: 0, lastAttempt: now };
        verifyAttempts.set(attemptKey, attempt);
      }
      
      const pedestal = await storage.getPedestal(pedestalId);
      
      if (!pedestal) {
        return res.status(404).json({ error: "Pedestal not found" });
      }
      
      // Verify access code
      if (pedestal.accessCode !== accessCode) {
        // Increment failed attempts
        attempt.count++;
        attempt.lastAttempt = now;
        
        // Check if max attempts exceeded
        if (attempt.count >= MAX_ATTEMPTS) {
          attempt.lockoutUntil = now + LOCKOUT_DURATION;
          console.warn(`[SECURITY] User ${userId} exceeded max attempts for pedestal ${pedestalId}. Locked out for 15 minutes.`);
          verifyAttempts.set(attemptKey, attempt);
          return res.status(429).json({ 
            error: `Too many failed attempts. Your access is locked for 15 minutes.` 
          });
        }
        
        verifyAttempts.set(attemptKey, attempt);
        console.warn(`[SECURITY] Failed access code attempt ${attempt.count}/${MAX_ATTEMPTS} by user ${userId} for pedestal ${pedestalId}`);
        return res.status(401).json({ error: "Invalid access code" });
      }
      
      // Success - clear failed attempts and grant access
      verifyAttempts.delete(attemptKey);
      
      if (!verifiedAccess.has(userId)) {
        verifiedAccess.set(userId, new Set());
      }
      verifiedAccess.get(userId)!.add(pedestalId);
      
      console.log(`[SECURITY] User ${userId} successfully verified access to pedestal ${pedestalId}`);
      
      // Return success without exposing access code
      const { accessCode: _, ...safePedestal } = pedestal;
      res.json({ verified: true, pedestal: safePedestal });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify access code" });
    }
  });

  app.post("/api/pedestals", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPedestalSchema.parse(req.body);
      const pedestal = await storage.createPedestal(validatedData);
      res.status(201).json(pedestal);
    } catch (error) {
      res.status(400).json({ error: "Invalid pedestal data" });
    }
  });

  app.get("/api/bookings", requireAuth, async (_req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  app.patch("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const updated = await storage.updateBooking(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  app.get("/api/service-requests", requireAuth, async (_req, res) => {
    try {
      const requests = await storage.getServiceRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  app.get("/api/service-requests/:id", requireAuth, async (req, res) => {
    try {
      const request = await storage.getServiceRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Service request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service request" });
    }
  });

  app.post("/api/service-requests", requireAuth, async (req, res) => {
    try {
      const validatedData = insertServiceRequestSchema.parse(req.body);
      const request = await storage.createServiceRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ error: "Invalid service request data" });
    }
  });

  app.patch("/api/service-requests/:id", requireAuth, async (req, res) => {
    try {
      const updated = await storage.updateServiceRequest(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Service request not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service request" });
    }
  });

  // Admin routes - require both authentication and admin privileges
  app.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { isAdmin } = req.body;
      const updated = await storage.updateUser(req.params.id, { isAdmin });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.get("/api/admin/pedestals", requireAuth, requireAdmin, async (_req, res) => {
    try {
      // Admin can see everything including access codes
      const pedestals = await storage.getPedestals();
      res.json(pedestals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pedestals" });
    }
  });

  app.get("/api/admin/bookings", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/admin/service-requests", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const requests = await storage.getServiceRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
