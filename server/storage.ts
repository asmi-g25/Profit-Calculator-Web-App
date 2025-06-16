import { estimates, type Estimate, type InsertEstimate, type UpdateEstimate } from "@shared/schema";

export interface IStorage {
  getEstimate(id: number): Promise<Estimate | undefined>;
  getAllEstimates(): Promise<Estimate[]>;
  getEstimatesByUser(createdBy: string): Promise<Estimate[]>;
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  updateEstimate(id: number, estimate: UpdateEstimate): Promise<Estimate | undefined>;
  deleteEstimate(id: number): Promise<boolean>;
  getEstimatesByStatus(status: string): Promise<Estimate[]>;
  searchEstimates(query: string): Promise<Estimate[]>;
}

export class MemStorage implements IStorage {
  private estimates: Map<number, Estimate>;
  private currentId: number;

  constructor() {
    this.estimates = new Map();
    this.currentId = 1;
  }

  async getEstimate(id: number): Promise<Estimate | undefined> {
    return this.estimates.get(id);
  }

  async getAllEstimates(): Promise<Estimate[]> {
    return Array.from(this.estimates.values()).sort((a, b) => b.id - a.id);
  }

  async getEstimatesByUser(createdBy: string): Promise<Estimate[]> {
    return Array.from(this.estimates.values())
      .filter(estimate => estimate.createdBy === createdBy)
      .sort((a, b) => b.id - a.id);
  }

  async createEstimate(insertEstimate: InsertEstimate): Promise<Estimate> {
    const id = this.currentId++;
    const estimate: Estimate = { 
      ...insertEstimate, 
      id,
      status: insertEstimate.status || "draft",
      transportCost: insertEstimate.transportCost || "0",
      packingCost: insertEstimate.packingCost || "0",
      fumigationCost: insertEstimate.fumigationCost || "0",
      customsClearanceCost: insertEstimate.customsClearanceCost || "0",
      exportDutyRate: insertEstimate.exportDutyRate || "0",
      defaultMargin: insertEstimate.defaultMargin || "15",
      freightCost: insertEstimate.freightCost || "0",
      importDuty: insertEstimate.importDuty || "0",
      destinationCustomsClearance: insertEstimate.destinationCustomsClearance || "0",
      destinationTransport: insertEstimate.destinationTransport || "0",
      distributorMargin: insertEstimate.distributorMargin || "12",
      retailerMargin: insertEstimate.retailerMargin || "20",
    };
    this.estimates.set(id, estimate);
    return estimate;
  }

  async updateEstimate(id: number, updateEstimate: UpdateEstimate): Promise<Estimate | undefined> {
    const existing = this.estimates.get(id);
    if (!existing) return undefined;

    const updated: Estimate = { ...existing, ...updateEstimate };
    this.estimates.set(id, updated);
    return updated;
  }

  async deleteEstimate(id: number): Promise<boolean> {
    return this.estimates.delete(id);
  }

  async getEstimatesByStatus(status: string): Promise<Estimate[]> {
    return Array.from(this.estimates.values())
      .filter(estimate => estimate.status === status)
      .sort((a, b) => b.id - a.id);
  }

  async searchEstimates(query: string): Promise<Estimate[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.estimates.values())
      .filter(estimate => 
        estimate.containerId.toLowerCase().includes(lowercaseQuery) ||
        estimate.destination.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => b.id - a.id);
  }
}

export const storage = new MemStorage();
