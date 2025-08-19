"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PersonalizedRecommendations from './personalized-recommendations';
import AiAdvisorChat from './ai-advisor-chat';
import { 
  MessageCircle, 
  Sparkles, 
  BotIcon, 
  TrendingUp,
  Zap,
  Heart
} from 'lucide-react';

interface SmartDashboardProps {
  customerProfile?: {
    name: string;
    loyaltyPoints: number;
    tier: string;
  };
}

export default function SmartDashboard({ customerProfile }: SmartDashboardProps) {
  const [activeTab, setActiveTab] = useState('recommendations');

  return (
    <div className="space-y-6">

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">AI Insights</div>
                <div className="font-medium">Personalized recommendations ready</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Smart Advisor</div>
                <div className="font-medium">Get instant help & tips</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Platform Benefits</div>
                <div className="font-medium">Maximizing your rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BotIcon className="h-6 w-6" />
            Smart Rewards Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Personalized For You
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                AI Advisor Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="mt-6">
              <PersonalizedRecommendations />
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <AiAdvisorChat />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>


    </div>
  );
}
