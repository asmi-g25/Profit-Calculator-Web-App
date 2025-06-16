import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEstimateSchema, updateEstimateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all estimates
  app.get("/api/estimates", async (req, res) => {
    try {
      const estimates = await storage.getAllEstimates();
      res.json(estimates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimates" });
    }
  });

  // Get estimates by status
  app.get("/api/estimates/status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      const estimates = await storage.getEstimatesByStatus(status);
      res.json(estimates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimates by status" });
    }
  });

  // Search estimates
  app.get("/api/estimates/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      const estimates = await storage.searchEstimates(q);
      res.json(estimates);
    } catch (error) {
      res.status(500).json({ message: "Failed to search estimates" });
    }
  });

  // Get single estimate
  app.get("/api/estimates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estimate ID" });
      }
      
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimate" });
    }
  });

  // Create new estimate
  app.post("/api/estimates", async (req, res) => {
    try {
      const validatedData = insertEstimateSchema.parse(req.body);
      const estimate = await storage.createEstimate(validatedData);
      res.status(201).json(estimate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create estimate" });
    }
  });

  // Update estimate
  app.patch("/api/estimates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estimate ID" });
      }

      const validatedData = updateEstimateSchema.parse(req.body);
      const estimate = await storage.updateEstimate(id, validatedData);
      
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      
      res.json(estimate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update estimate" });
    }
  });

  // Delete estimate
  app.delete("/api/estimates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estimate ID" });
      }

      const deleted = await storage.deleteEstimate(id);
      if (!deleted) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete estimate" });
    }
  });

  // Duplicate estimate
  app.post("/api/estimates/:id/duplicate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estimate ID" });
      }

      const original = await storage.getEstimate(id);
      if (!original) {
        return res.status(404).json({ message: "Original estimate not found" });
      }

      const { id: _, ...estimateData } = original;
      const duplicated = await storage.createEstimate({
        ...estimateData,
        containerId: `${estimateData.containerId}-COPY`,
        status: "draft",
        products: estimateData.products as any,
        calculationResults: estimateData.calculationResults as any,
      });

      res.status(201).json(duplicated);
    } catch (error) {
      res.status(500).json({ message: "Failed to duplicate estimate" });
    }
  });

  // Calculate estimate (for validation/preview)
  app.post("/api/estimates/calculate", async (req, res) => {
    try {
      const data = req.body;
      // This would contain the calculation logic
      // For now, returning a placeholder response
      res.json({ 
        message: "Calculation completed",
        results: data.calculationResults || {}
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate estimate" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
