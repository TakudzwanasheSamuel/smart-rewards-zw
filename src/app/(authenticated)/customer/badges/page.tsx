"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Star, Users, Activity, Sparkles, Crown, Medal, Heart } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { badgeApi } from "@/lib/api";
import { formatPointsAsCurrency } from "@/lib/currency";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_reward: number;
  isEarned?: boolean;
  earnedAt?: string;
}

interface BadgeResponse {
  earnedBadges: Array<{
    id: string;
    customer_id: string;
    badge_id: string;
    earned_at: string;
    badge: BadgeData;
  }>;
  allBadges: Array<BadgeData & { isEarned: boolean; earnedAt?: string }>;
  totalEarned: number;
  totalAvailable: number;
}

const categoryIcons = {
  activity: Activity,
  social: Users,
  milestone: Trophy,
  special: Star
};

const categoryColors = {
  activity: "bg-blue-100 text-blue-800 border-blue-200",
  social: "bg-green-100 text-green-800 border-green-200",
  milestone: "bg-purple-100 text-purple-800 border-purple-200",
  special: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

export default function BadgesPage() {
  const { user } = useAuth();
  const [badgeData, setBadgeData] = useState<BadgeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("earned");

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await badgeApi.getMyBadges(true);
        setBadgeData(response);
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchBadges();
    }
  }, [user]);

  const checkForNewBadges = async () => {
    try {
      const result = await badgeApi.checkForNewBadges();
      if (result.count > 0) {
        // Refresh badge data
        const response = await badgeApi.getMyBadges(true);
        setBadgeData(response);
      }
      return result;
    } catch (error) {
      console.error('Error checking for new badges:', error);
      return { count: 0, newBadges: [] };
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center">Loading your badges...</div>
      </div>
    );
  }

  if (!badgeData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center">Unable to load badges. Please try again.</div>
      </div>
    );
  }

  const renderBadge = (badge: BadgeData, isEarned: boolean = false, earnedAt?: string) => {
    const IconComponent = (LucideIcons as any)[badge.icon] || LucideIcons.Award;
    const categoryIcon = categoryIcons[badge.category as keyof typeof categoryIcons] || Activity;
    const categoryColor = categoryColors[badge.category as keyof typeof categoryColors] || categoryColors.activity;

    return (
      <Card 
        key={badge.id} 
        className={`transition-all duration-200 hover:shadow-md ${
          isEarned 
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
            : 'bg-muted/30 border-muted opacity-70'
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <IconComponent 
                className={`h-12 w-12 ${
                  isEarned ? 'text-yellow-600' : 'text-muted-foreground'
                }`} 
              />
              {isEarned && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Star className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
            <Badge className={`${categoryColor} text-xs`}>
              {badge.category}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className={`font-semibold ${isEarned ? 'text-gray-900' : 'text-muted-foreground'}`}>
              {badge.name}
            </h3>
            <p className={`text-sm ${isEarned ? 'text-gray-600' : 'text-muted-foreground'}`}>
              {badge.description}
            </p>
            
            <div className="flex items-center justify-between pt-2">
              <span className={`text-sm font-medium ${
                isEarned ? 'text-yellow-600' : 'text-muted-foreground'
              }`}>
                {formatPointsAsCurrency(badge.points_reward)} reward
              </span>
              
              {isEarned && earnedAt && (
                <span className="text-xs text-muted-foreground">
                  Earned {new Date(earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const groupedEarnedBadges = badgeData.earnedBadges.reduce((acc, item) => {
    const category = item.badge.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof badgeData.earnedBadges>);

  const groupedAllBadges = badgeData.allBadges.reduce((acc, badge) => {
    const category = badge.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, BadgeData[]>);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Badges</h1>
          <p className="text-muted-foreground">
            Track your achievements and unlock new rewards
          </p>
        </div>
        <Button onClick={checkForNewBadges} variant="outline">
          <Sparkles className="h-4 w-4 mr-2" />
          Check for New Badges
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{badgeData.totalEarned}</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{badgeData.totalAvailable}</p>
                <p className="text-sm text-muted-foreground">Total Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Medal className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((badgeData.totalEarned / badgeData.totalAvailable) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Collection */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earned">Earned Badges ({badgeData.totalEarned})</TabsTrigger>
          <TabsTrigger value="all">All Badges ({badgeData.totalAvailable})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="earned" className="space-y-6">
          {badgeData.totalEarned > 0 ? (
            Object.entries(groupedEarnedBadges).map(([category, badges]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Activity;
                    return <IconComponent className="h-5 w-5" />;
                  })()}
                  <h2 className="text-xl font-semibold capitalize">{category}</h2>
                  <Badge variant="secondary">{badges.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((item) => 
                    renderBadge(item.badge, true, item.earned_at)
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No badges earned yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete activities to earn your first badges!
              </p>
              <Button onClick={() => setActiveTab("all")} variant="outline">
                View Available Badges
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-6">
          {Object.entries(groupedAllBadges).map(([category, badges]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Activity;
                  return <IconComponent className="h-5 w-5" />;
                })()}
                <h2 className="text-xl font-semibold capitalize">{category}</h2>
                <Badge variant="secondary">{badges.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => 
                  renderBadge(badge, badge.isEarned, badge.earnedAt)
                )}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
