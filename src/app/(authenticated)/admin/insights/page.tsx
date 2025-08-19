"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Download,
  RefreshCw,
  BarChart3,
  Settings,
  Calendar,
  DollarSign
} from "lucide-react";
import EnhancedAiInsights from "@/components/admin/ai-insights-enhanced";

interface InsightsSettings {
  analysisType: 'comprehensive' | 'quick' | 'specific';
  focusArea: 'growth' | 'retention' | 'engagement' | 'revenue' | 'all';
  autoRefresh: boolean;
  refreshInterval: number;
}

export default function AdminInsightsPage() {
  const [settings, setSettings] = useState<InsightsSettings>({
    analysisType: 'comprehensive',
    focusArea: 'all',
    autoRefresh: false,
    refreshInterval: 30
  });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Force refresh by reloading the page or triggering a re-fetch
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  const handleSettingsChange = (key: keyof InsightsSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (settings.autoRefresh) {
      interval = setInterval(() => {
        handleRefresh();
      }, settings.refreshInterval * 60 * 1000); // Convert minutes to milliseconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [settings.autoRefresh, settings.refreshInterval]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Business Insights</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis and recommendations for your loyalty program
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Analysis Settings
          </CardTitle>
          <CardDescription>
            Customize how your business insights are generated and displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Analysis Type</label>
              <Select 
                value={settings.analysisType} 
                onValueChange={(value: any) => handleSettingsChange('analysisType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick Analysis</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="specific">Specific Focus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Focus Area</label>
              <Select 
                value={settings.focusArea} 
                onValueChange={(value: any) => handleSettingsChange('focusArea', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="retention">Retention</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Auto Refresh</label>
              <Select 
                value={settings.autoRefresh ? 'enabled' : 'disabled'} 
                onValueChange={(value) => handleSettingsChange('autoRefresh', value === 'enabled')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.autoRefresh && (
              <div>
                <label className="text-sm font-medium mb-2 block">Refresh Interval</label>
                <Select 
                  value={settings.refreshInterval.toString()} 
                  onValueChange={(value) => handleSettingsChange('refreshInterval', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights Dashboard */}
      <EnhancedAiInsights />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks based on your insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="font-medium">Create New Offer</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Launch targeted offers based on customer segments
              </span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Adjust Loyalty Tiers</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Optimize tier requirements and benefits
              </span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Launch Mukando Campaign</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Start community savings programs
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export and Reporting */}
      <Card>
        <CardHeader>
          <CardTitle>Reports & Export</CardTitle>
          <CardDescription>
            Download detailed reports for stakeholders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Executive Summary
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Metrics Report
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Generate Action Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
