import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Globe,
  Package
} from "lucide-react";
import type { Estimate } from "@shared/schema";

interface BusinessIntelligenceProps {
  userRole: string;
}

export default function BusinessIntelligence({ userRole }: BusinessIntelligenceProps) {
  const [timeframe, setTimeframe] = useState("3months");
  const [kpiView, setKpiView] = useState("overview");

  const { data: estimates = [] } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });

  // Calculate comprehensive KPIs
  const calculateKPIs = () => {
    const completedEstimates = estimates.filter(e => e.status === "completed");
    const totalEstimates = estimates.length;
    
    // Revenue Metrics
    const totalRevenue = completedEstimates.reduce((sum, estimate) => {
      const results = estimate.calculationResults as any;
      return sum + (results?.importerTotalCost || 0);
    }, 0);

    const avgOrderValue = completedEstimates.length > 0 ? totalRevenue / completedEstimates.length : 0;

    // Margin Analysis
    const margins = completedEstimates.map(e => parseFloat(e.defaultMargin));
    const avgMargin = margins.length > 0 ? margins.reduce((sum, margin) => sum + margin, 0) / margins.length : 0;
    const marginStdDev = margins.length > 0 ? Math.sqrt(margins.reduce((sum, margin) => sum + Math.pow(margin - avgMargin, 2), 0) / margins.length) : 0;

    // Cost Efficiency
    const avgProcurementCost = completedEstimates.reduce((sum, estimate) => {
      const results = estimate.calculationResults as any;
      return sum + (results?.totalProcurementCost || 0);
    }, 0) / (completedEstimates.length || 1);

    const avgLogisticsCost = completedEstimates.reduce((sum, estimate) => {
      const results = estimate.calculationResults as any;
      return sum + (results?.totalLogisticsCost || 0);
    }, 0) / (completedEstimates.length || 1);

    // Geographic Distribution
    const destinationCounts = estimates.reduce((acc, estimate) => {
      acc[estimate.destination] = (acc[estimate.destination] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Product Performance
    const productStats = new Map();
    estimates.forEach(estimate => {
      const products = estimate.products as any[];
      if (!products) return;

      products.filter(p => p.included).forEach(product => {
        if (!productStats.has(product.name)) {
          productStats.set(product.name, { count: 0, totalQuantity: 0, totalValue: 0 });
        }
        const stats = productStats.get(product.name);
        stats.count++;
        stats.totalQuantity += product.quantity;
        stats.totalValue += product.quantity * product.unitPrice;
      });
    });

    const topProducts = Array.from(productStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    // Risk Assessment
    const lowMarginEstimates = completedEstimates.filter(e => parseFloat(e.defaultMargin) < 10).length;
    const highValueEstimates = completedEstimates.filter(e => {
      const results = e.calculationResults as any;
      return (results?.importerTotalCost || 0) > 100000;
    }).length;

    return {
      totalRevenue,
      totalEstimates,
      completedEstimates: completedEstimates.length,
      avgOrderValue,
      avgMargin,
      marginStdDev,
      avgProcurementCost,
      avgLogisticsCost,
      topDestinations,
      topProducts,
      lowMarginEstimates,
      highValueEstimates,
      conversionRate: totalEstimates > 0 ? (completedEstimates.length / totalEstimates) * 100 : 0,
    };
  };

  // Calculate performance alerts
  const generateAlerts = (kpis: any) => {
    const alerts = [];
    
    if (kpis.avgMargin < 15) {
      alerts.push({
        type: "warning",
        title: "Low Average Margin",
        description: `Current average margin (${kpis.avgMargin.toFixed(1)}%) is below recommended 15%`,
        impact: "medium"
      });
    }

    if (kpis.conversionRate < 60) {
      alerts.push({
        type: "error",
        title: "Low Conversion Rate",
        description: `Only ${kpis.conversionRate.toFixed(1)}% of estimates are being completed`,
        impact: "high"
      });
    }

    if (kpis.lowMarginEstimates > kpis.completedEstimates * 0.3) {
      alerts.push({
        type: "warning",
        title: "High Risk Estimates",
        description: `${kpis.lowMarginEstimates} estimates have margins below 10%`,
        impact: "medium"
      });
    }

    if (kpis.marginStdDev > 5) {
      alerts.push({
        type: "info",
        title: "Margin Variability",
        description: `High margin variability detected (σ=${kpis.marginStdDev.toFixed(1)}%)`,
        impact: "low"
      });
    }

    return alerts;
  };

  const kpis = calculateKPIs();
  const alerts = generateAlerts(kpis);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="text-red-500" size={16} />;
      case "warning": return <AlertTriangle className="text-yellow-500" size={16} />;
      case "info": return <CheckCircle className="text-blue-500" size={16} />;
      default: return <CheckCircle className="text-green-500" size={16} />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error": return "border-red-200 bg-red-50";
      case "warning": return "border-yellow-200 bg-yellow-50";
      case "info": return "border-blue-200 bg-blue-50";
      default: return "border-green-200 bg-green-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Business Intelligence Dashboard</h3>
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
          <Select value={kpiView} onValueChange={setKpiView}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="geographic">Geographic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">${(kpis.totalRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-blue-100 text-sm">Avg: ${(kpis.avgOrderValue / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                <DollarSign size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Avg Margin</p>
                <p className="text-2xl font-bold">{kpis.avgMargin.toFixed(1)}%</p>
                <p className="text-green-100 text-sm">σ: {kpis.marginStdDev.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
                <TrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Conversion Rate</p>
                <p className="text-2xl font-bold">{kpis.conversionRate.toFixed(1)}%</p>
                <p className="text-purple-100 text-sm">{kpis.completedEstimates}/{kpis.totalEstimates} completed</p>
              </div>
              <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
                <Target size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Cost Efficiency</p>
                <p className="text-2xl font-bold">${(kpis.avgProcurementCost / 1000).toFixed(0)}K</p>
                <p className="text-orange-100 text-sm">Proc. cost</p>
              </div>
              <div className="p-3 bg-orange-400 bg-opacity-30 rounded-full">
                <BarChart3 size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle size={20} />
              <span>Performance Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <Alert key={index} className={getAlertColor(alert.type)}>
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <AlertDescription className="text-gray-700">
                      {alert.description}
                    </AlertDescription>
                    <Badge variant="outline" className="mt-2">
                      {alert.impact.toUpperCase()} IMPACT
                    </Badge>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe size={20} />
              <span>Top Destinations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.topDestinations.map(([destination, count], index) => (
                <div key={destination} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-900">{destination}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500">estimates</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package size={20} />
              <span>Top Products by Value</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.count} estimates</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${(product.totalValue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">{product.totalQuantity.toFixed(0)} MT</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar size={20} />
            <span>Executive Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Financial Performance</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Total revenue: ${(kpis.totalRevenue / 1000000).toFixed(1)}M</li>
                <li>• Average order value: ${(kpis.avgOrderValue / 1000).toFixed(0)}K</li>
                <li>• Average margin: {kpis.avgMargin.toFixed(1)}%</li>
                <li>• High-value deals: {kpis.highValueEstimates}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Operational Efficiency</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Conversion rate: {kpis.conversionRate.toFixed(1)}%</li>
                <li>• Avg procurement cost: ${(kpis.avgProcurementCost / 1000).toFixed(0)}K</li>
                <li>• Avg logistics cost: ${(kpis.avgLogisticsCost / 1000).toFixed(0)}K</li>
                <li>• Risk estimates: {kpis.lowMarginEstimates}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Market Insights</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Top destination: {kpis.topDestinations[0]?.[0] || 'N/A'}</li>
                <li>• Best product: {kpis.topProducts[0]?.name || 'N/A'}</li>
                <li>• Market diversity: {kpis.topDestinations.length} countries</li>
                <li>• Product range: {kpis.topProducts.length} active</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}