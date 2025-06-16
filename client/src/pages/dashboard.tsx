import { useState } from "react";
import { Sprout, Plus, Calculator, TrendingUp, DollarSign, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateEstimateForm from "@/components/create-estimate-form";
import EstimatesHistory from "@/components/estimates-history";
import Reports from "@/components/reports";
import { useQuery } from "@tanstack/react-query";
import type { Estimate } from "@shared/schema";

export default function Dashboard() {
  const [userRole] = useState<string>("admin"); // In real app, this would come from auth context
  const [userName] = useState<string>("John Doe");
  const [userInitials] = useState<string>("JD");

  const { data: estimates = [] } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });

  // Calculate statistics
  const totalEstimates = estimates.length;
  const activeContainers = estimates.filter(e => e.status === "completed").length;
  const totalValue = estimates.reduce((sum, estimate) => {
    const results = estimate.calculationResults as any;
    return sum + (results?.importerTotalCost || 0);
  }, 0);
  const avgMargin = estimates.length > 0 
    ? estimates.reduce((sum, e) => sum + parseFloat(e.defaultMargin), 0) / estimates.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sprout className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Grain Export Calculator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {userRole === "admin" ? "Admin" : "Ops Analyst"}
              </Badge>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{userInitials}</span>
                </div>
                <span className="text-sm text-gray-700">{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Pricing Dashboard</h2>
              <p className="text-gray-600">Manage grain export estimates and profitability calculations</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calculator className="text-blue-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Estimates</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEstimates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="text-green-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Containers</p>
                  <p className="text-2xl font-bold text-gray-900">{activeContainers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="text-yellow-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Avg. Margin</p>
                  <p className="text-2xl font-bold text-gray-900">{avgMargin.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="text-purple-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${(totalValue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <Tabs defaultValue="create-estimate" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="create-estimate" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-6 py-4"
                >
                  Create Estimate
                </TabsTrigger>
                <TabsTrigger 
                  value="estimates-history" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-6 py-4"
                >
                  Estimates History
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-6 py-4"
                >
                  Reports
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="create-estimate" className="p-6">
              <CreateEstimateForm userRole={userRole} />
            </TabsContent>

            <TabsContent value="estimates-history" className="p-6">
              <EstimatesHistory userRole={userRole} />
            </TabsContent>

            <TabsContent value="reports" className="p-6">
              <Reports userRole={userRole} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
