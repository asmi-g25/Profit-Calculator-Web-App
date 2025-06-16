import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import type { Estimate } from "@shared/schema";

interface AdvancedAnalyticsProps {
  userRole: string;
}

export default function AdvancedAnalytics({ userRole }: AdvancedAnalyticsProps) {
  const [timeframe, setTimeframe] = useState("3months");
  const [comparison, setComparison] = useState("previous");

  const { data: estimates = [] } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });

  // Calculate trend analysis
  const calculateTrends = () => {
    const completedEstimates = estimates.filter(e => e.status === "completed");
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const recentEstimates = completedEstimates.filter(e => 
      new Date(e.estimateDate) >= threeMonthsAgo
    );
    const previousEstimates = completedEstimates.filter(e => 
      new Date(e.estimateDate) >= sixMonthsAgo && new Date(e.estimateDate) < threeMonthsAgo
    );

    const recentRevenue = recentEstimates.reduce((sum, e) => {
      const results = e.calculationResults as any;
      return sum + (results?.importerTotalCost || 0);
    }, 0);

    const previousRevenue = previousEstimates.reduce((sum, e) => {
      const results = e.calculationResults as any;
      return sum + (results?.importerTotalCost || 0);
    }, 0);

    const recentMargin = recentEstimates.length > 0
      ? recentEstimates.reduce((sum, e) => sum + parseFloat(e.defaultMargin), 0) / recentEstimates.length
      : 0;

    const previousMargin = previousEstimates.length > 0
      ? previousEstimates.reduce((sum, e) => sum + parseFloat(e.defaultMargin), 0) / previousEstimates.length
      : 0;

    return {
      revenueGrowth: previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      marginChange: previousMargin > 0 ? ((recentMargin - previousMargin) / previousMargin) * 100 : 0,
      volumeGrowth: previousEstimates.length > 0 ? ((recentEstimates.length - previousEstimates.length) / previousEstimates.length) * 100 : 0,
      recentRevenue,
      recentMargin,
      recentVolume: recentEstimates.length,
    };
  };

  // Calculate product performance
  const calculateProductPerformance = () => {
    const productStats = new Map();
    
    estimates.forEach(estimate => {
      const products = estimate.products as any[];
      if (!products) return;

      products.filter(p => p.included).forEach(product => {
        const key = product.name;
        if (!productStats.has(key)) {
          productStats.set(key, {
            name: product.name,
            totalQuantity: 0,
            totalRevenue: 0,
            averageMargin: 0,
            estimateCount: 0,
            margins: [],
          });
        }

        const stats = productStats.get(key);
        stats.totalQuantity += product.quantity;
        stats.totalRevenue += product.quantity * product.unitPrice * (1 + product.margin / 100);
        stats.margins.push(product.margin);
        stats.estimateCount++;
      });
    });

    return Array.from(productStats.values()).map(stat => ({
      ...stat,
      averageMargin: stat.margins.reduce((sum: number, margin: number) => sum + margin, 0) / stat.margins.length,
      averageUnitPrice: stat.totalRevenue / stat.totalQuantity,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  // Calculate destination analysis
  const calculateDestinationAnalysis = () => {
    const destinationStats = new Map();
    
    estimates.forEach(estimate => {
      if (!destinationStats.has(estimate.destination)) {
        destinationStats.set(estimate.destination, {
          destination: estimate.destination,
          estimateCount: 0,
          totalRevenue: 0,
          averageMargin: 0,
          margins: [],
        });
      }

      const stats = destinationStats.get(estimate.destination);
      stats.estimateCount++;
      
      const results = estimate.calculationResults as any;
      if (results) {
        stats.totalRevenue += results.importerTotalCost || 0;
      }
      
      stats.margins.push(parseFloat(estimate.defaultMargin));
    });

    return Array.from(destinationStats.values()).map(stat => ({
      ...stat,
      averageMargin: stat.margins.reduce((sum, margin) => sum + margin, 0) / stat.margins.length,
      averageOrderValue: stat.totalRevenue / stat.estimateCount,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const trends = calculateTrends();
  const productPerformance = calculateProductPerformance();
  const destinationAnalysis = calculateDestinationAnalysis();

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="text-green-500" size={16} />
    ) : (
      <TrendingDown className="text-red-500" size={16} />
    );
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Advanced Analytics</h3>
        <div className="flex space-x-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={comparison} onValueChange={setComparison}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previous">Previous Period</SelectItem>
              <SelectItem value="yearago">Year Ago</SelectItem>
              <SelectItem value="baseline">Baseline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trend Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Growth</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{trends.revenueGrowth.toFixed(1)}%</p>
                  {getTrendIcon(trends.revenueGrowth)}
                </div>
                <p className="text-sm text-gray-500">vs previous period</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="text-blue-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Margin Performance</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{trends.marginChange.toFixed(1)}%</p>
                  {getTrendIcon(trends.marginChange)}
                </div>
                <p className="text-sm text-gray-500">margin change</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="text-green-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volume Growth</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{trends.volumeGrowth.toFixed(1)}%</p>
                  {getTrendIcon(trends.volumeGrowth)}
                </div>
                <p className="text-sm text-gray-500">container volume</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <PieChart className="text-purple-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 size={20} />
            <span>Product Performance Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Margin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productPerformance.map((product, index) => (
                    <tr key={product.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {product.totalQuantity.toFixed(0)} MT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        ${(product.totalRevenue / 1000).toFixed(0)}K
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {product.averageMargin.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        ${product.averageUnitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {index === 0 && <Badge className="bg-green-100 text-green-800">Top Performer</Badge>}
                        {index === 1 && <Badge className="bg-blue-100 text-blue-800">Strong</Badge>}
                        {index >= 2 && <Badge variant="outline">Average</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No product data available</p>
          )}
        </CardContent>
      </Card>

      {/* Destination Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart size={20} />
            <span>Destination Market Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {destinationAnalysis.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AOV</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {destinationAnalysis.map((dest) => (
                      <tr key={dest.destination} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dest.destination}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {dest.estimateCount}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          ${(dest.totalRevenue / 1000).toFixed(0)}K
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          ${(dest.averageOrderValue / 1000).toFixed(0)}K
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Market Insights</h4>
                {destinationAnalysis.slice(0, 3).map((dest, index) => (
                  <div key={dest.destination} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{dest.destination}</p>
                      <p className="text-xs text-gray-500">Avg margin: {dest.averageMargin.toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{((dest.totalRevenue / destinationAnalysis.reduce((sum, d) => sum + d.totalRevenue, 0)) * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">market share</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No destination data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}