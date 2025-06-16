import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GRAIN_PRODUCTS } from "@/lib/constants";
import { calculateEstimate } from "@/lib/calculations";
import CalculationResults from "@/components/calculation-results";
import type { InsertEstimate, Product } from "@shared/schema";

const formSchema = z.object({
  containerId: z.string().min(1, "Container ID is required"),
  destination: z.string().min(1, "Destination is required"),
  estimateDate: z.string().min(1, "Estimate date is required"),
  products: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(0),
    unitPrice: z.number().min(0),
    included: z.boolean(),
    margin: z.number().min(0),
  })),
  transportCost: z.number().min(0),
  packingCost: z.number().min(0),
  fumigationCost: z.number().min(0),
  customsClearanceCost: z.number().min(0),
  exportDutyRate: z.number().min(0),
  defaultMargin: z.number().min(0),
  freightCost: z.number().min(0),
  importDuty: z.number().min(0),
  destinationCustomsClearance: z.number().min(0),
  destinationTransport: z.number().min(0),
  distributorMargin: z.number().min(0),
  retailerMargin: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateEstimateFormProps {
  userRole: string;
}

export default function CreateEstimateForm({ userRole }: CreateEstimateFormProps) {
  const [showResults, setShowResults] = useState(false);
  const [calculationResults, setCalculationResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      containerId: "",
      destination: "",
      estimateDate: new Date().toISOString().split('T')[0],
      products: GRAIN_PRODUCTS.map(product => ({
        name: product.name,
        quantity: 0,
        unitPrice: 0,
        included: false,
        margin: 15,
      })),
      transportCost: 0,
      packingCost: 0,
      fumigationCost: 0,
      customsClearanceCost: 0,
      exportDutyRate: 0,
      defaultMargin: 15,
      freightCost: 0,
      importDuty: 0,
      destinationCustomsClearance: 0,
      destinationTransport: 0,
      distributorMargin: 12,
      retailerMargin: 20,
    },
  });

  const createEstimateMutation = useMutation({
    mutationFn: async (data: InsertEstimate) => {
      const response = await apiRequest("POST", "/api/estimates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Success",
        description: "Estimate saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save estimate",
        variant: "destructive",
      });
    },
  });

  const applyDefaultMargin = () => {
    const defaultMargin = form.getValues("defaultMargin");
    const products = form.getValues("products");
    
    const updatedProducts = products.map(product => ({
      ...product,
      margin: defaultMargin,
    }));
    
    form.setValue("products", updatedProducts);
    toast({
      title: "Success",
      description: "Default margin applied to all products",
    });
  };

  const calculateResults = () => {
    const formData = form.getValues();
    const results = calculateEstimate(formData);
    setCalculationResults(results);
    setShowResults(true);
    
    toast({
      title: "Calculation Complete",
      description: "Estimate has been calculated successfully",
    });
  };

  const saveEstimate = (status: "draft" | "completed") => {
    const formData = form.getValues();
    
    const estimateData: InsertEstimate = {
      ...formData,
      status,
      products: formData.products,
      transportCost: formData.transportCost.toString(),
      packingCost: formData.packingCost.toString(),
      fumigationCost: formData.fumigationCost.toString(),
      customsClearanceCost: formData.customsClearanceCost.toString(),
      exportDutyRate: formData.exportDutyRate.toString(),
      defaultMargin: formData.defaultMargin.toString(),
      freightCost: formData.freightCost.toString(),
      importDuty: formData.importDuty.toString(),
      destinationCustomsClearance: formData.destinationCustomsClearance.toString(),
      destinationTransport: formData.destinationTransport.toString(),
      distributorMargin: formData.distributorMargin.toString(),
      retailerMargin: formData.retailerMargin.toString(),
      calculationResults: calculationResults,
      createdBy: "current-user", // In real app, get from auth context
      userRole,
    };

    createEstimateMutation.mutate(estimateData);
  };

  const resetForm = () => {
    form.reset();
    setShowResults(false);
    setCalculationResults(null);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form className="space-y-8">
          {/* Container Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Container Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="containerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Container ID</FormLabel>
                    <FormControl>
                      <Input placeholder="CONT-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Japan">Japan</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimateDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimate Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Selection</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (MT)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price ($/MT)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value ($)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Include</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {GRAIN_PRODUCTS.map((product, index) => {
                    const watchedQuantity = form.watch(`products.${index}.quantity`);
                    const watchedUnitPrice = form.watch(`products.${index}.unitPrice`);
                    const totalValue = (watchedQuantity || 0) * (watchedUnitPrice || 0);
                    
                    return (
                      <tr key={product.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 ${product.colorClass} rounded-lg flex items-center justify-center mr-3`}>
                              <product.icon className={`${product.iconColorClass}`} size={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FormField
                            control={form.control}
                            name={`products.${index}.quantity`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                className="w-24"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FormField
                            control={form.control}
                            name={`products.${index}.unitPrice`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                className="w-28 font-mono"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900">${totalValue.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FormField
                            control={form.control}
                            name={`products.${index}.included`}
                            render={({ field }) => (
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Procurement Costs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Procurement Costs at Origin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="transportCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Cost ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="packingCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Packing Cost ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fumigationCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fumigation Cost ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customsClearanceCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customs Clearance ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exportDutyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Export Duty (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Margin Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Margin Configuration</h3>
            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="defaultMargin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Margin (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="w-32 font-mono"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={applyDefaultMargin}
                    className="mt-6"
                  >
                    Apply to All Products
                  </Button>
                </div>
                
                {/* Individual Margin Overrides */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Individual Product Margins</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {GRAIN_PRODUCTS.map((product, index) => (
                      <div key={product.name} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 w-24">{product.name}:</span>
                        <FormField
                          control={form.control}
                          name={`products.${index}.margin`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              className="w-20 font-mono text-sm"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          )}
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logistics Costs at Destination */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logistics Costs at Destination</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="freightCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Freight Cost ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="importDuty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Import Duty ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destinationCustomsClearance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customs Clearance ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destinationTransport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport to Destination ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Multi-tier Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-tier Pricing Margins</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distributorMargin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distributor Margin (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retailerMargin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retailer Margin (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="font-mono"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => saveEstimate("draft")}
              disabled={createEstimateMutation.isPending}
            >
              Save as Draft
            </Button>
            <Button type="button" onClick={calculateResults}>
              Calculate Estimate
            </Button>
          </div>
        </form>
      </Form>

      {/* Calculation Results */}
      {showResults && calculationResults && (
        <CalculationResults 
          results={calculationResults} 
          onSave={() => saveEstimate("completed")}
          isSaving={createEstimateMutation.isPending}
          containerId={form.getValues("containerId")}
          destination={form.getValues("destination")}
        />
      )}
    </div>
  );
}
