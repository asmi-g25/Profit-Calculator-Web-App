import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalculationResultsProps {
  results: any;
  onSave: () => void;
  isSaving: boolean;
}

export default function CalculationResults({ results, onSave, isSaving }: CalculationResultsProps) {
  const { toast } = useToast();

  const exportToPDF = () => {
    toast({
      title: "Export to PDF",
      description: "PDF export functionality would be implemented here",
    });
  };

  const exportToExcel = () => {
    toast({
      title: "Export to Excel", 
      description: "Excel export functionality would be implemented here",
    });
  };

  return (
    <div className="space-y-6 border-t border-gray-200 pt-8">
      <h3 className="text-lg font-semibold text-gray-900">Calculation Results</h3>
      
      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-blue-900">Total Procurement Cost</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Raw Materials:</span>
              <span className="font-mono text-blue-900">${results.rawMaterialsCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Transport:</span>
              <span className="font-mono text-blue-900">${results.transportCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Packing:</span>
              <span className="font-mono text-blue-900">${results.packingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Other Costs:</span>
              <span className="font-mono text-blue-900">${results.otherCosts.toFixed(2)}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-blue-900">Total:</span>
                <span className="font-mono text-blue-900">${results.totalProcurementCost.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-green-900">Invoice Pricing (with Margin)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Procurement Cost:</span>
              <span className="font-mono text-green-900">${results.totalProcurementCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Margin Amount:</span>
              <span className="font-mono text-green-900">${results.marginAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Export Duty:</span>
              <span className="font-mono text-green-900">${results.exportDutyAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-green-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-green-900">Invoice Value:</span>
                <span className="font-mono text-green-900">${results.invoiceValue.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logistics and Final Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-yellow-900">Logistics Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-700">Freight:</span>
              <span className="font-mono text-yellow-900">${results.freightCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-700">Import Duty:</span>
              <span className="font-mono text-yellow-900">${results.importDutyCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-700">Other:</span>
              <span className="font-mono text-yellow-900">${results.otherLogisticsCosts.toFixed(2)}</span>
            </div>
            <div className="border-t border-yellow-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-yellow-900">Total:</span>
                <span className="font-mono text-yellow-900">${results.totalLogisticsCost.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-purple-900">Importer Cost</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Procurement:</span>
              <span className="font-mono text-purple-900">${results.invoiceValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Logistics:</span>
              <span className="font-mono text-purple-900">${results.totalLogisticsCost.toFixed(2)}</span>
            </div>
            <div className="border-t border-purple-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-purple-900">Total Cost:</span>
                <span className="font-mono text-purple-900">${results.importerTotalCost.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-gray-900">Tier Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Distributor Price:</span>
              <span className="font-mono text-gray-900">${results.distributorPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Retailer Price:</span>
              <span className="font-mono text-gray-900">${results.retailerPrice.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-sm">
                <span className="text-green-700">Total Margin:</span>
                <span className="font-mono text-green-900">{results.totalMarginPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product-wise Breakdown */}
      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-4">Product-wise Pricing Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retailer Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.productBreakdown.map((product: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{product.quantity} MT</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">${product.unitCost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{product.margin.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">${product.invoicePrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">${product.distributorPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">${product.retailerPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save and Export Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Last calculated: {new Date().toLocaleString()}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportToPDF}>
            <FileDown className="mr-2" size={16} />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <FileDown className="mr-2" size={16} />
            Export Excel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            <Save className="mr-2" size={16} />
            {isSaving ? "Saving..." : "Save Estimate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
