import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertPropertySchema, insertMeetingSchema, insertCustomFieldSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.get("/api/clients/:clientId/properties", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const properties = await storage.getPropertiesByClient(clientId);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client properties" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const propertyData = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(id, propertyData);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProperty(id);
      if (!deleted) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Meeting routes
  app.get("/api/meetings", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let meetings;
      
      if (startDate && endDate) {
        meetings = await storage.getMeetingsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        meetings = await storage.getMeetings();
      }
      
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meeting = await storage.getMeeting(id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  app.get("/api/clients/:clientId/meetings", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const meetings = await storage.getMeetingsByClient(clientId);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client meetings" });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      const meetingData = insertMeetingSchema.parse(req.body);
      const meeting = await storage.createMeeting(meetingData);
      res.status(201).json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.put("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meetingData = insertMeetingSchema.partial().parse(req.body);
      const meeting = await storage.updateMeeting(id, meetingData);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  app.delete("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMeeting(id);
      if (!deleted) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const clients = await storage.getClients();
      const properties = await storage.getProperties();
      const meetings = await storage.getMeetings();

      const totalClients = clients.length;
      const totalProperties = properties.length;
      const activeListings = properties.filter(p => p.status === "listed").length;
      
      const portfolioValue = properties.reduce((sum, property) => {
        return sum + parseFloat(property.price);
      }, 0);

      const clientStatusDistribution = {
        active: clients.filter(c => c.status === "active").length,
        prospect: clients.filter(c => c.status === "prospect").length,
        inactive: clients.filter(c => c.status === "inactive").length,
      };

      const propertyTypeDistribution = {
        residential: properties.filter(p => p.propertyType === "residential").length,
        commercial: properties.filter(p => p.propertyType === "commercial").length,
        industrial: properties.filter(p => p.propertyType === "industrial").length,
      };

      const upcomingMeetings = meetings.filter(m => {
        const meetingDate = new Date(m.scheduledAt);
        return meetingDate > new Date() && m.status === "scheduled";
      }).slice(0, 5);

      res.json({
        totalClients,
        totalProperties,
        portfolioValue,
        activeListings,
        clientStatusDistribution,
        propertyTypeDistribution,
        upcomingMeetings,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Custom fields routes
  app.get("/api/custom-fields/:entityType", async (req, res) => {
    try {
      const { entityType } = req.params;
      const customFields = await storage.getCustomFields(entityType);
      res.json(customFields);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom fields" });
    }
  });

  app.post("/api/custom-fields", async (req, res) => {
    try {
      const customFieldData = insertCustomFieldSchema.parse(req.body);
      const customField = await storage.createCustomField(customFieldData);
      res.status(201).json(customField);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid custom field data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create custom field" });
    }
  });

  app.put("/api/custom-fields/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customFieldData = insertCustomFieldSchema.partial().parse(req.body);
      const customField = await storage.updateCustomField(id, customFieldData);
      if (!customField) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.json(customField);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid custom field data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update custom field" });
    }
  });

  app.delete("/api/custom-fields/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomField(id);
      if (!deleted) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete custom field" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
