import { pgTable, text, serial, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  containerId: text("container_id").notNull(),
  destination: text("destination").notNull(),
  estimateDate: text("estimate_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, completed, archived
  
  // Product quantities and prices
  products: jsonb("products").notNull(), // Array of {name, quantity, unitPrice, included, margin}
  
  // Procurement costs
  transportCost: decimal("transport_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  packingCost: decimal("packing_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  fumigationCost: decimal("fumigation_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  customsClearanceCost: decimal("customs_clearance_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  exportDutyRate: decimal("export_duty_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  
  // Default margin
  defaultMargin: decimal("default_margin", { precision: 5, scale: 2 }).notNull().default("15"),
  
  // Logistics costs at destination
  freightCost: decimal("freight_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  importDuty: decimal("import_duty", { precision: 10, scale: 2 }).notNull().default("0"),
  destinationCustomsClearance: decimal("destination_customs_clearance", { precision: 10, scale: 2 }).notNull().default("0"),
  destinationTransport: decimal("destination_transport", { precision: 10, scale: 2 }).notNull().default("0"),
  
  // Multi-tier margins
  distributorMargin: decimal("distributor_margin", { precision: 5, scale: 2 }).notNull().default("12"),
  retailerMargin: decimal("retailer_margin", { precision: 5, scale: 2 }).notNull().default("20"),
  
  // Calculated results (stored for performance)
  calculationResults: jsonb("calculation_results"), // Store calculated breakdown
  
  createdBy: text("created_by").notNull(),
  userRole: text("user_role").notNull(), // admin, ops_analyst
});

export const insertEstimateSchema = createInsertSchema(estimates).omit({
  id: true,
});

export const updateEstimateSchema = createInsertSchema(estimates).omit({
  id: true,
}).partial();

export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type Estimate = typeof estimates.$inferSelect;
export type UpdateEstimate = z.infer<typeof updateEstimateSchema>;

// Product type definition
export const productSchema = z.object({
  name: z.string(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  included: z.boolean(),
  margin: z.number().min(0),
});

export type Product = z.infer<typeof productSchema>;

// Calculation results type
export const calculationResultsSchema = z.object({
  rawMaterialsCost: z.number(),
  transportCost: z.number(),
  packingCost: z.number(),
  fumigationCost: z.number(),
  customsClearanceCost: z.number(),
  otherCosts: z.number(),
  totalProcurementCost: z.number(),
  marginAmount: z.number(),
  exportDutyAmount: z.number(),
  invoiceValue: z.number(),
  freightCost: z.number(),
  importDutyCost: z.number(),
  destinationCustomsClearance: z.number(),
  destinationTransport: z.number(),
  otherLogisticsCosts: z.number(),
  totalLogisticsCost: z.number(),
  importerTotalCost: z.number(),
  distributorPrice: z.number(),
  retailerPrice: z.number(),
  totalMarginPercentage: z.number(),
  productBreakdown: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unitCost: z.number(),
    margin: z.number(),
    invoicePrice: z.number(),
    distributorPrice: z.number(),
    retailerPrice: z.number(),
  })),
});

export type CalculationResults = z.infer<typeof calculationResultsSchema>;
