import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Percent, Truck, FileDown, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Estimate } from "@shared/schema";

interface ReportsProps {
  userRole: string;
}

export default function Reports({ userRole }: ReportsProps) {
  const [dateRange, setDateRange] = useState("last30days");
  const [productType, setProductType] = useState("all");
  const [destination, setDestination] = useState("all");
  const { toast } = useToast();

  const { data: estimates = [] } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });

  // Calculate report statistics
  const calculateStats = () => {
    const completedEstimates = estimates.filter(e => e.status === "completed");
    
    const totalRevenue = completedEstimates.reduce((sum, estimate) => {
      const results = estimate.calculationResults as any;
      return sum + (results?.importerTotalCost || 0);
    }, 0);

    const avgMargin = completedEstimates.length > 0 
      ? completedEstimates.reduce((sum, e) => sum + parseFloat(e.defaultMargin), 0) / completedEstimates.length 
      : 0;

    const containersShipped = completedEstimates.length;

    return {
      totalRevenue,
      avgMargin,
      containersShipped,
    };
  };

  const stats = calculateStats();

  // Generate report data for table
  const generateReportData = () => {
    const productStats = new Map();
    
    estimates.forEach(estimate => {
      const products = estimate.products as any[];
      if (!products) return;

      products.filter(p => p.included).forEach(product => {
        const key = product.name;
        if (!productStats.has(key)) {
          productStats.set(key, {
            product: product.name,
            quantity: 0,
            revenue: 0,
            costs: 0,
            period: "Jan 2024", // This would be dynamic in a real app
          });
        }

        const stats = productStats.get(key);
        stats.quantity += product.quantity;
        stats.revenue += product.quantity * product.unitPrice * (1 + product.margin / 100);
        stats.costs += product.quantity * product.unitPrice;
      });
    });

    return Array.from(productStats.values()).map(stat => ({
      ...stat,
      profit: stat.revenue - stat.costs,
      margin: stat.revenue > 0 ? ((stat.revenue - stat.costs) / stat.revenue * 100) : 0,
    }));
  };

  const reportData = generateReportData();

  const exportReportPDF = () => {
    toast({
      title: "Export Report",
      description: "PDF export functionality would be implemented here",
    });
  };

  const exportReportExcel = () => {
    toast({
      title: "Export Report",
      description: "Excel export functionality would be implemented here",
    });
  };

  const scheduleReport = () => {
    toast({
      title: "Schedule Report",
      description: "Report scheduling functionality would be implemented here",
    });
  };

  const generateReport = () => {
    toast({
      title: "Report Generated",
      description: "Report has been generated with current filters",
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Reports & Analytics</h3>
      
      {/* Report Filters */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="last90days">Last 90 days</SelectItem>
                  <SelectItem value="thisyear">This year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="millets">Millets</SelectItem>
                  <SelectItem value="pulses">Pulses</SelectItem>
                  <SelectItem value="oils">Oils</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="jp">Japan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} className="w-full">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">${(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-blue-100 text-sm mt-1">+12.5% from last period</p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                <TrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Average Margin</p>
                <p className="text-2xl font-bold">{stats.avgMargin.toFixed(1)}%</p>
                <p className="text-green-100 text-sm mt-1">+2.1% from last period</p>
              </div>
              <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
                <Percent size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Containers Shipped</p>
                <p className="text-2xl font-bold">{stats.containersShipped}</p>
                <p className="text-purple-100 text-sm mt-1">+8 from last period</p>
              </div>
              <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
                <Truck size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      {reportData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (MT)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.period}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{row.quantity.toFixed(0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">${row.revenue.toFixed(0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">${row.costs.toFixed(0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">${row.profit.toFixed(0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{row.margin.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No data available for the selected filters. Create some estimates to see reports.
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={exportReportPDF}>
          <FileDown className="mr-2" size={16} />
          Export PDF
        </Button>
        <Button variant="outline" onClick={exportReportExcel}>
          <FileDown className="mr-2" size={16} />
          Export Excel
        </Button>
        <Button onClick={scheduleReport}>
          <Clock className="mr-2" size={16} />
          Schedule Report
        </Button>
      </div>
    </div>
  );
}
