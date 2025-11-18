import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPedestalSchema, insertBookingSchema, insertServiceRequestSchema } from "@shared/schema";
import { requireAuth } from "./supabaseAuth";

export async function registerRoutes(app: Express): Promise<Server> {
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
      res.json(pedestals);
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
      res.json(pedestal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pedestal" });
    }
  });

  app.patch("/api/pedestals/:id", requireAuth, async (req, res) => {
    try {
      const updated = await storage.updatePedestal(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Pedestal not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update pedestal" });
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

  const httpServer = createServer(app);

  return httpServer;
}
