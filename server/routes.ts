import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPedestalSchema, insertBookingSchema, insertServiceRequestSchema } from "@shared/schema";
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
      
      // Validate input
      if (!accessCode || typeof accessCode !== 'string' || accessCode.length !== 6) {
        return res.status(400).json({ error: "Invalid access code format" });
      }
      
      const pedestal = await storage.getPedestal(req.params.id);
      
      if (!pedestal) {
        return res.status(404).json({ error: "Pedestal not found" });
      }
      
      if (pedestal.accessCode !== accessCode) {
        return res.status(401).json({ error: "Invalid access code" });
      }
      
      // Store verified access for this user
      const userId = req.user.id;
      if (!verifiedAccess.has(userId)) {
        verifiedAccess.set(userId, new Set());
      }
      verifiedAccess.get(userId)!.add(req.params.id);
      
      // Return success without exposing access code
      const { accessCode: _, ...safePedestal } = pedestal;
      res.json({ verified: true, pedestal: safePedestal });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify access code" });
    }
  });

  app.post("/api/pedestals", requireAuth, async (req, res) => {
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
