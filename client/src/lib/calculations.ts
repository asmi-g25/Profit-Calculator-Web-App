export interface CalculationInput {
  products: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    included: boolean;
    margin: number;
  }>;
  transportCost: number;
  packingCost: number;
  fumigationCost: number;
  customsClearanceCost: number;
  exportDutyRate: number;
  freightCost: number;
  importDuty: number;
  destinationCustomsClearance: number;
  destinationTransport: number;
  distributorMargin: number;
  retailerMargin: number;
}

export interface CalculationResults {
  rawMaterialsCost: number;
  transportCost: number;
  packingCost: number;
  fumigationCost: number;
  customsClearanceCost: number;
  otherCosts: number;
  totalProcurementCost: number;
  marginAmount: number;
  exportDutyAmount: number;
  invoiceValue: number;
  freightCost: number;
  importDutyCost: number;
  destinationCustomsClearance: number;
  destinationTransport: number;
  otherLogisticsCosts: number;
  totalLogisticsCost: number;
  importerTotalCost: number;
  distributorPrice: number;
  retailerPrice: number;
  totalMarginPercentage: number;
  productBreakdown: Array<{
    name: string;
    quantity: number;
    unitCost: number;
    margin: number;
    invoicePrice: number;
    distributorPrice: number;
    retailerPrice: number;
  }>;
}

export function calculateEstimate(input: CalculationInput): CalculationResults {
  // Filter included products
  const includedProducts = input.products.filter(p => p.included && p.quantity > 0);
  
  // Calculate raw materials cost
  const rawMaterialsCost = includedProducts.reduce((sum, product) => {
    return sum + (product.quantity * product.unitPrice);
  }, 0);

  // Calculate other procurement costs
  const otherCosts = input.fumigationCost + input.customsClearanceCost;
  const totalProcurementCost = rawMaterialsCost + input.transportCost + input.packingCost + otherCosts;

  // Calculate weighted average margin
  const totalProductValue = includedProducts.reduce((sum, product) => {
    return sum + (product.quantity * product.unitPrice);
  }, 0);
  
  const weightedMargin = totalProductValue > 0 
    ? includedProducts.reduce((sum, product) => {
        const weight = (product.quantity * product.unitPrice) / totalProductValue;
        return sum + (product.margin * weight);
      }, 0)
    : 0;

  // Calculate margin amount
  const marginAmount = totalProcurementCost * (weightedMargin / 100);
  
  // Calculate invoice value before export duty
  const invoiceValueBeforeDuty = totalProcurementCost + marginAmount;
  
  // Calculate export duty based on invoice value
  const exportDutyAmount = invoiceValueBeforeDuty * (input.exportDutyRate / 100);
  
  // Final invoice value
  const invoiceValue = invoiceValueBeforeDuty + exportDutyAmount;

  // Calculate logistics costs
  const otherLogisticsCosts = input.destinationCustomsClearance + input.destinationTransport;
  const totalLogisticsCost = input.freightCost + input.importDuty + otherLogisticsCosts;

  // Calculate importer total cost
  const importerTotalCost = invoiceValue + totalLogisticsCost;

  // Calculate distributor and retailer pricing
  const distributorPrice = importerTotalCost * (1 + input.distributorMargin / 100);
  const retailerPrice = distributorPrice * (1 + input.retailerMargin / 100);

  // Calculate total margin percentage
  const totalMarginPercentage = totalProcurementCost > 0 
    ? ((retailerPrice - totalProcurementCost) / totalProcurementCost) * 100 
    : 0;

  // Calculate product breakdown
  const productBreakdown = includedProducts.map(product => {
    const productTotal = product.quantity * product.unitPrice;
    const productShare = totalProductValue > 0 ? productTotal / totalProductValue : 0;
    
    // Allocate costs proportionally
    const allocatedProcurementCost = totalProcurementCost * productShare;
    const allocatedInvoiceValue = invoiceValue * productShare;
    const allocatedImporterCost = importerTotalCost * productShare;
    const allocatedDistributorPrice = distributorPrice * productShare;
    const allocatedRetailerPrice = retailerPrice * productShare;

    return {
      name: product.name,
      quantity: product.quantity,
      unitCost: product.unitPrice,
      margin: product.margin,
      invoicePrice: allocatedInvoiceValue / product.quantity,
      distributorPrice: allocatedDistributorPrice / product.quantity,
      retailerPrice: allocatedRetailerPrice / product.quantity,
    };
  });

  return {
    rawMaterialsCost,
    transportCost: input.transportCost,
    packingCost: input.packingCost,
    fumigationCost: input.fumigationCost,
    customsClearanceCost: input.customsClearanceCost,
    otherCosts,
    totalProcurementCost,
    marginAmount,
    exportDutyAmount,
    invoiceValue,
    freightCost: input.freightCost,
    importDutyCost: input.importDuty,
    destinationCustomsClearance: input.destinationCustomsClearance,
    destinationTransport: input.destinationTransport,
    otherLogisticsCosts,
    totalLogisticsCost,
    importerTotalCost,
    distributorPrice,
    retailerPrice,
    totalMarginPercentage,
    productBreakdown,
  };
}
