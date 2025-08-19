"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { aiInsightsApi } from "@/lib/api";
import { 
  BotMessageSquare, 
  TrendingUp, 
  Users, 
  Target, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  DollarSign,
  UserCheck,
  Rocket,
  Heart
} from "lucide-react";

interface BusinessInsightsData {
  summary: {
    totalCustomers: number;
    growthRate: number;
    retentionRate: number;
    churnRate: number;
    engagementScore: number;
    mukandoEngagement: number;
    performanceScore: number;
  };
  metrics: any;
  segments: Array<{
    segmentName: string;
    customerCount: number;
    characteristics: string[];
    recommendations: string[];
    averagePoints: number;
    engagementLevel: 'high' | 'medium' | 'low';
  }>;
  insights: {
    opportunities: Array<{
      type: string;
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      estimatedImpact: string;
      recommendedActions: string[];
    }>;
    alerts: Array<{
      type: 'warning' | 'info' | 'success';
      title: string;
      message: string;
      actionRequired: boolean;
    }>;
  };
  aiAnalysis?: {
    executiveSummary: string;
    keyFindings: string[];
    performanceScore: number;
    recommendations: Array<{
      category: string;
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      expectedImpact: string;
      timeframe: string;
      effort: 'low' | 'medium' | 'high';
    }>;
    riskFactors: string[];
    opportunities: string[];
    nextSteps: string[];
  };
  recommendations: {
    programs: any[];
    offers: any[];
    rules: any[];
  };
}

function PerformanceOverview({ data }: { data: BusinessInsightsData }) {
  const { summary } = data;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Overall Performance Score
          </CardTitle>
          <div className={`text-4xl font-bold ${getScoreColor(summary.performanceScore)}`}>
            {summary.performanceScore}/100
          </div>
          <Badge variant={summary.performanceScore >= 70 ? "default" : "destructive"}>
            {getScoreLabel(summary.performanceScore)}
          </Badge>
        </CardHeader>
        <CardContent>
          <Progress value={summary.performanceScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Customers</span>
            </div>
            <div className="text-2xl font-bold">{summary.totalCustomers}</div>
            <div className="text-sm text-muted-foreground">
              {summary.growthRate > 0 ? '+' : ''}{summary.growthRate.toFixed(1)}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Retention Rate</span>
            </div>
            <div className="text-2xl font-bold">{summary.retentionRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">
              {summary.churnRate.toFixed(1)}% churn rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <div className="text-2xl font-bold">{summary.engagementScore}%</div>
            <div className="text-sm text-muted-foreground">
              Monthly active users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Mukando</span>
            </div>
            <div className="text-2xl font-bold">{summary.mukandoEngagement.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">
              Community engagement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {data.insights.alerts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Important Alerts</h4>
          {data.insights.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <div>
                <div className="font-medium">{alert.title}</div>
                <AlertDescription>{alert.message}</AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerSegments({ segments }: { segments: any[] }) {
  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {segments.map((segment, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{segment.segmentName}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{segment.customerCount} customers</Badge>
                <Badge className={getEngagementColor(segment.engagementLevel)}>
                  {segment.engagementLevel} engagement
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Characteristics</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {segment.characteristics.map((char: string, i: number) => (
                    <li key={i}>• {char}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Recommendations</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {segment.recommendations.map((rec: string, i: number) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm">
                <span className="font-medium">Average Points: </span>
                {segment.averagePoints.toFixed(0)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OpportunitiesAndRecommendations({ data }: { data: BusinessInsightsData }) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Growth Opportunities */}
      <div>
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Growth Opportunities
        </h4>
        <div className="space-y-3">
          {data.insights.opportunities.slice(0, 5).map((opportunity, index) => (
            <Card key={index} className={`border ${getPriorityColor(opportunity.priority)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getPriorityIcon(opportunity.priority)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{opportunity.title}</h5>
                      <Badge variant="outline" className="capitalize">
                        {opportunity.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {opportunity.description}
                    </p>
                    <div className="mb-3">
                      <span className="text-sm font-medium">Expected Impact: </span>
                      <span className="text-sm text-green-600">{opportunity.estimatedImpact}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Action Items:</span>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                        {opportunity.recommendedActions.slice(0, 3).map((action, i) => (
                          <li key={i}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      {data.aiAnalysis && (
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <BotMessageSquare className="h-5 w-5" />
            AI-Powered Recommendations
          </h4>
          <div className="space-y-3">
            {data.aiAnalysis.recommendations.slice(0, 5).map((rec, index) => (
              <Card key={index} className={`border ${getPriorityColor(rec.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{rec.title}</h5>
                        <div className="flex gap-2">
                          <Badge variant="outline">{rec.category}</Badge>
                          <Badge variant="outline" className="capitalize">
                            {rec.effort} effort
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Expected Impact: </span>
                          <span className="text-green-600">{rec.expectedImpact}</span>
                        </div>
                        <div>
                          <span className="font-medium">Timeframe: </span>
                          <span className="text-blue-600">{rec.timeframe}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutiveSummary({ aiAnalysis }: { aiAnalysis: any }) {
  if (!aiAnalysis) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BotMessageSquare className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {aiAnalysis.executiveSummary}
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiAnalysis.keyFindings.map((finding: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {finding}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiAnalysis.nextSteps.map((step: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {aiAnalysis.riskFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiAnalysis.riskFactors.map((risk: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function EnhancedAiInsights() {
  const [data, setData] = useState<BusinessInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchInsights() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await aiInsightsApi.getBusinessInsights({
          type: 'comprehensive',
          focus: 'all',
          includeMetrics: true
        });
        
        if (response.success) {
          setData(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch insights');
        }
      } catch (err: any) {
        console.error('Error fetching AI insights:', err);
        setError(err.message || 'Failed to load insights');
      } finally {
        setIsLoading(false);
      }
    }

    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BotMessageSquare className="h-6 w-6" />
            AI Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BotMessageSquare className="h-6 w-6" />
            AI Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load insights: {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BotMessageSquare className="h-6 w-6" />
            AI Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No insights available. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BotMessageSquare className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>AI Business Insights</CardTitle>
              <CardDescription>Real-time analysis & actionable recommendations</CardDescription>
            </div>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="summary">AI Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4">
            <PerformanceOverview data={data} />
          </TabsContent>
          
          <TabsContent value="segments" className="pt-4">
            <CustomerSegments segments={data.segments} />
          </TabsContent>
          
          <TabsContent value="recommendations" className="pt-4">
            <OpportunitiesAndRecommendations data={data} />
          </TabsContent>
          
          <TabsContent value="summary" className="pt-4">
            <ExecutiveSummary aiAnalysis={data.aiAnalysis} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
