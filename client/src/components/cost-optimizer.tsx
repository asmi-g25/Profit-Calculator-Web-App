import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, TrendingDown, Calculator, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CalculationResults } from "@shared/schema";

interface CostOptimizerProps {
  currentResults: CalculationResults;
  onOptimize: (recommendations: OptimizationRecommendation[]) => void;
}

interface OptimizationRecommendation {
  category: string;
  description: string;
  impact: number;
  implementationCost: number;
  priority: "high" | "medium" | "low";
  timeframe: string;
}

export default function CostOptimizer({ currentResults, onOptimize }: CostOptimizerProps) {
  const [targetMargin, setTargetMargin] = useState(20);
  const [maxCostReduction, setMaxCostReduction] = useState(10);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const { toast } = useToast();

  const generateOptimizationRecommendations = (): OptimizationRecommendation[] => {
    const recs: OptimizationRecommendation[] = [];
    
    // Analyze raw materials cost
    if (currentResults.rawMaterialsCost > 0) {
      const materialOptimization = (currentResults.rawMaterialsCost * 0.05); // 5% potential savings
      recs.push({
        category: "Raw Materials",
        description: "Negotiate better supplier contracts or explore alternative sourcing",
        impact: materialOptimization,
        implementationCost: materialOptimization * 0.1,
        priority: "high",
        timeframe: "2-3 months"
      });
    }

    // Analyze transport costs
    if (currentResults.transportCost > 0) {
      const transportOptimization = (currentResults.transportCost * 0.15); // 15% potential savings
      recs.push({
        category: "Transport",
        description: "Optimize route planning and consolidate shipments",
        impact: transportOptimization,
        implementationCost: transportOptimization * 0.05,
        priority: "medium",
        timeframe: "1-2 months"
      });
    }

    // Analyze packaging efficiency
    if (currentResults.packingCost > 0) {
      const packingOptimization = (currentResults.packingCost * 0.20); // 20% potential savings
      recs.push({
        category: "Packaging",
        description: "Implement eco-friendly packaging and bulk purchasing",
        impact: packingOptimization,
        implementationCost: packingOptimization * 0.15,
        priority: "medium",
        timeframe: "1 month"
      });
    }

    // Analyze logistics costs
    if (currentResults.totalLogisticsCost > 0) {
      const logisticsOptimization = (currentResults.totalLogisticsCost * 0.08); // 8% potential savings
      recs.push({
        category: "Logistics",
        description: "Partner with freight forwarders for better rates",
        impact: logisticsOptimization,
        implementationCost: logisticsOptimization * 0.02,
        priority: "high",
        timeframe: "3-4 months"
      });
    }

    // Margin optimization
    const currentMargin = currentResults.totalMarginPercentage;
    if (currentMargin < targetMargin) {
      const marginGap = targetMargin - currentMargin;
      recs.push({
        category: "Margin Enhancement",
        description: `Increase margins by ${marginGap.toFixed(1)}% through premium positioning`,
        impact: (currentResults.retailerPrice * marginGap) / 100,
        implementationCost: 0,
        priority: "high",
        timeframe: "Immediate"
      });
    }

    return recs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const calculateOptimizedScenario = () => {
    const recs = generateOptimizationRecommendations();
    setRecommendations(recs);
    
    const totalSavings = recs.reduce((sum, rec) => sum + rec.impact, 0);
    const totalImplementationCost = recs.reduce((sum, rec) => sum + rec.implementationCost, 0);
    
    toast({
      title: "Optimization Analysis Complete",
      description: `Potential savings: $${totalSavings.toFixed(0)} with implementation cost: $${totalImplementationCost.toFixed(0)}`,
    });

    onOptimize(recs);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <Target className="text-red-600" size={16} />;
      case "medium": return <TrendingDown className="text-yellow-600" size={16} />;
      case "low": return <Lightbulb className="text-green-600" size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator size={20} />
            <span>Cost Optimization Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetMargin">Target Margin (%)</Label>
              <Input
                id="targetMargin"
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)}
                className="font-mono"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="maxCostReduction">Max Cost Reduction (%)</Label>
              <Input
                id="maxCostReduction"
                type="number"
                value={maxCostReduction}
                onChange={(e) => setMaxCostReduction(parseFloat(e.target.value) || 0)}
                className="font-mono"
                step="0.1"
              />
            </div>
          </div>
          
          <Button onClick={calculateOptimizedScenario} className="w-full">
            <Calculator className="mr-2" size={16} />
            Generate Optimization Recommendations
          </Button>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb size={20} />
              <span>Optimization Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <Alert key={index} className="border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getPriorityIcon(rec.priority)}
                        <h4 className="font-semibold text-gray-900">{rec.category}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <AlertDescription className="text-gray-700">
                        {rec.description}
                      </AlertDescription>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Potential Savings:</span>
                          <p className="font-mono font-semibold text-green-600">
                            ${rec.impact.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Implementation Cost:</span>
                          <p className="font-mono font-semibold text-red-600">
                            ${rec.implementationCost.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Timeframe:</span>
                          <p className="font-semibold text-blue-600">
                            {rec.timeframe}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Optimization Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Potential Savings:</span>
                  <p className="font-mono font-bold text-green-600 text-lg">
                    ${recommendations.reduce((sum, rec) => sum + rec.impact, 0).toFixed(0)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Total Implementation Cost:</span>
                  <p className="font-mono font-bold text-red-600 text-lg">
                    ${recommendations.reduce((sum, rec) => sum + rec.implementationCost, 0).toFixed(0)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Net Benefit:</span>
                  <p className="font-mono font-bold text-blue-600 text-lg">
                    ${(recommendations.reduce((sum, rec) => sum + rec.impact, 0) - 
                       recommendations.reduce((sum, rec) => sum + rec.implementationCost, 0)).toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}