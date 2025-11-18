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
  // Store verified pedestal access in memory (ephemeral session data, resets on server restart)
  const verifiedAccess = new Map<string, Set<string>>(); // userId -> Set of pedestalIds
  
  // Calculate lockout duration based on failed attempts (exponential backoff)
  const calculateLockoutDuration = (failedAttempts: number): number => {
    // Exponential backoff: 5min, 15min, 1hr, 4hr, 12hr, 24hr
    const durations = [
      5 * 60 * 1000,      // 5 minutes (1-2 attempts)
      15 * 60 * 1000,     // 15 minutes (3-4 attempts)
      60 * 60 * 1000,     // 1 hour (5-6 attempts)
      4 * 60 * 60 * 1000, // 4 hours (7-9 attempts)
      12 * 60 * 60 * 1000, // 12 hours (10-14 attempts)
      24 * 60 * 60 * 1000  // 24 hours (15+ attempts)
    ];
    
    if (failedAttempts <= 2) return durations[0];
    if (failedAttempts <= 4) return durations[1];
    if (failedAttempts <= 6) return durations[2];
    if (failedAttempts <= 9) return durations[3];
    if (failedAttempts <= 14) return durations[4];
    return durations[5];
  };

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

  // New endpoint: verify access by code only (no pedestal selection needed)
  app.post("/api/pedestals/verify-by-code", requireAuth, async (req: any, res) => {
    try {
      const { accessCode } = req.body;
      const userId = req.user.id;
      
      // Validate input
      if (!accessCode || typeof accessCode !== 'string' || accessCode.length !== 6) {
        return res.status(400).json({ error: "Invalid access code format" });
      }
      
      // Find pedestal by access code using database query
      let pedestal;
      try {
        pedestal = await storage.getPedestalByAccessCode(accessCode);
      } catch (dbError: any) {
        console.error("[SECURITY] Database error in verify-by-code:", dbError);
        return res.status(500).json({ error: "Database error. Please try again." });
      }
      
      if (!pedestal) {
        // Don't reveal that the code doesn't exist - just return generic error
        return res.status(404).json({ error: "Invalid access code" });
      }
      
      const pedestalId = pedestal.id;
      
      // Check rate limiting from database
      const now = Date.now();
      let attempt = await storage.getVerificationAttempt(userId, pedestalId);
      
      // Check if currently locked out
      if (attempt?.lockoutUntil) {
        const lockoutTime = new Date(attempt.lockoutUntil).getTime();
        if (now < lockoutTime) {
          const remainingMs = lockoutTime - now;
          const remainingMinutes = Math.ceil(remainingMs / 60000);
          const remainingHours = Math.floor(remainingMs / 3600000);
          
          let timeMsg = `${remainingMinutes} minute(s)`;
          if (remainingHours >= 1) {
            timeMsg = `${remainingHours} hour(s)`;
          }
          
          console.warn(`[SECURITY] User ${userId} locked out for pedestal ${pedestalId}. ${timeMsg} remaining.`);
          return res.status(429).json({ 
            error: `Too many failed attempts. Please try again in ${timeMsg}.` 
          });
        }
      }
      
      // Success - clear failed attempts and grant access
      if (attempt) {
        console.log(`[SECURITY] User ${userId} successfully verified access to pedestal ${pedestalId} after ${attempt.totalFailed} previous failed attempts`);
        await storage.deleteVerificationAttempt(userId, pedestalId);
      } else {
        console.log(`[SECURITY] User ${userId} successfully verified access to pedestal ${pedestalId} on first try`);
      }
      
      if (!verifiedAccess.has(userId)) {
        verifiedAccess.set(userId, new Set());
      }
      verifiedAccess.get(userId)!.add(pedestalId);
      
      // Return success without exposing access code
      const { accessCode: _, ...safePedestal } = pedestal;
      res.json({ verified: true, pedestal: safePedestal });
    } catch (error: any) {
      console.error("[SECURITY] Error in verify-by-code:", error);
      const errorMessage = error?.message || "Failed to verify access code";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/pedestals/:id/verify-access", requireAuth, async (req: any, res) => {
    try {
      const { accessCode } = req.body;
      const userId = req.user.id;
      const pedestalId = req.params.id;
      
      // Validate input
      if (!accessCode || typeof accessCode !== 'string' || accessCode.length !== 6) {
        return res.status(400).json({ error: "Invalid access code format" });
      }
      
      // Check rate limiting from database
      const now = Date.now();
      let attempt = await storage.getVerificationAttempt(userId, pedestalId);
      
      // Check if currently locked out
      if (attempt?.lockoutUntil) {
        const lockoutTime = new Date(attempt.lockoutUntil).getTime();
        if (now < lockoutTime) {
          const remainingMs = lockoutTime - now;
          const remainingMinutes = Math.ceil(remainingMs / 60000);
          const remainingHours = Math.floor(remainingMs / 3600000);
          
          let timeMsg = `${remainingMinutes} minute(s)`;
          if (remainingHours >= 1) {
            timeMsg = `${remainingHours} hour(s)`;
          }
          
          console.warn(`[SECURITY] User ${userId} locked out for pedestal ${pedestalId}. ${timeMsg} remaining. Total failed: ${attempt.totalFailed}`);
          return res.status(429).json({ 
            error: `Too many failed attempts. Please try again in ${timeMsg}.` 
          });
        }
      }
      
      const pedestal = await storage.getPedestal(pedestalId);
      
      if (!pedestal) {
        return res.status(404).json({ error: "Pedestal not found" });
      }
      
      // Verify access code
      if (pedestal.accessCode !== accessCode) {
        // Increment failed attempts
        const newTotalFailed = (attempt?.totalFailed || 0) + 1;
        
        // Calculate progressive lockout based on total failed attempts
        const lockoutDuration = calculateLockoutDuration(newTotalFailed);
        const lockoutUntil = new Date(now + lockoutDuration);
        
        // Update attempt tracking in database
        await storage.upsertVerificationAttempt({
          userId,
          pedestalId,
          totalFailed: newTotalFailed,
          lockoutUntil,
        });
        
        const lockoutMinutes = Math.ceil(lockoutDuration / 60000);
        const lockoutHours = Math.floor(lockoutDuration / 3600000);
        let lockoutMsg = `${lockoutMinutes} minute(s)`;
        if (lockoutHours >= 1) {
          lockoutMsg = `${lockoutHours} hour(s)`;
        }
        
        console.warn(`[SECURITY] Failed attempt #${newTotalFailed} by user ${userId} for pedestal ${pedestalId}. Locked out for ${lockoutMsg}.`);
        
        return res.status(429).json({ 
          error: `Invalid access code. Your access is locked for ${lockoutMsg} due to repeated failed attempts.` 
        });
      }
      
      // Success - clear failed attempts and grant access
      if (attempt) {
        console.log(`[SECURITY] User ${userId} successfully verified access to pedestal ${pedestalId} after ${attempt.totalFailed} previous failed attempts`);
        await storage.deleteVerificationAttempt(userId, pedestalId);
      } else {
        console.log(`[SECURITY] User ${userId} successfully verified access to pedestal ${pedestalId} on first try`);
      }
      
      if (!verifiedAccess.has(userId)) {
        verifiedAccess.set(userId, new Set());
      }
      verifiedAccess.get(userId)!.add(pedestalId);
      
      // Return success without exposing access code
      const { accessCode: _, ...safePedestal } = pedestal;
      res.json({ verified: true, pedestal: safePedestal });
    } catch (error) {
      console.error("[SECURITY] Error in verify-access:", error);
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
