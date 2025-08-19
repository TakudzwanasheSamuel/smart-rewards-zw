"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, Users, ArrowRight, Award, Trophy, QrCode } from "lucide-react";
import Link from "next/link";
import PersonalizedOffers from "@/components/customer/personalized-offers";
import SmartDashboard from "@/components/customer/smart-dashboard";
import CheckInButton from "@/components/customer/check-in-button";
import { useAuth } from "@/contexts/auth-context";
import { customerApi, mukandoApi, badgeApi } from "@/lib/api";
import { formatPointsAsCurrency, getPointsDisplayText } from "@/lib/currency";
import * as LucideIcons from "lucide-react";

interface CustomerProfile {
  loyalty_points: number;
  loyalty_tier: string;
  full_name?: string;
}

interface MukandoGroup {
  id: string;
  goal_name: string;
  goal_points_required: number;
  total_mukando_points: number;
  status: string;
  contribution_interval: string;
  term_length: number;
  progressPercentage: number;
  memberCount: number;
  business: {
    business_name: string;
  };
  members: Array<{
    payout_order: number;
    customer: {
      user_id: string;
      full_name: string;
    };
  }>;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_reward: number;
  earned_at?: string;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [mukandoGroup, setMukandoGroup] = useState<MukandoGroup | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMukandoLoading, setIsMukandoLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await customerApi.getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMukandoGroups = async () => {
      try {
        const response = await mukandoApi.getMyGroups('approved');
        if (response.groups && response.groups.length > 0) {
          // Show the most recent active group
          const activeGroup = response.groups[0];
          setMukandoGroup(activeGroup);
        }
      } catch (error) {
        console.error('Failed to fetch Mukando groups:', error);
      } finally {
        setIsMukandoLoading(false);
      }
    };

    const fetchBadges = async () => {
      try {
        const response = await badgeApi.getMyBadges();
        if (response.badges) {
          setBadges(response.badges.map((cb: any) => ({
            id: cb.badge.id,
            name: cb.badge.name,
            description: cb.badge.description,
            icon: cb.badge.icon,
            category: cb.badge.category,
            points_reward: cb.badge.points_reward,
            earned_at: cb.earned_at
          })));
        }
      } catch (error) {
        console.error('Failed to fetch badges:', error);
        // Don't fail dashboard loading if badges fail
        setBadges([]);
      }
    };

    if (user) {
      fetchProfile();
      fetchMukandoGroups();
      fetchBadges();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="text-center">Loading your dashboard...</div>
      </div>
    );
  }

  const loyaltyPoints = profile?.loyalty_points || 0;
  const loyaltyTier = profile?.loyalty_tier || 'Bronze';
  const customerName = profile?.full_name || user?.fullName || 'Customer';

  // Calculate tier progress (simplified)
  const tierThresholds = { Bronze: 0, Silver: 1000, Gold: 3000, Platinum: 10000 };
  const currentThreshold = tierThresholds[loyaltyTier as keyof typeof tierThresholds] || 0;
  const nextTierName = loyaltyTier === 'Platinum' ? 'Platinum' : 
    loyaltyTier === 'Gold' ? 'Platinum' : 
    loyaltyTier === 'Silver' ? 'Gold' : 'Silver';
  const nextThreshold = tierThresholds[nextTierName as keyof typeof tierThresholds] || 10000;
  const progressPercentage = loyaltyTier === 'Platinum' ? 100 : 
    Math.min(100, ((loyaltyPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">Welcome Back, {customerName}!</h1>
          <p className="text-muted-foreground">Here&apos;s your loyalty summary.</p>
        </div>
        <div className="flex gap-2">
            <CheckInButton />
            <Link href="/customer/scan" passHref>
                <Button size="lg">
                    <QrCode className="mr-2 h-5 w-5" />
                    Scan & Earn
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Points</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Worth {formatPointsAsCurrency(loyaltyPoints)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tier: {loyaltyTier}</CardTitle>
             <CardDescription className="text-xs">
               {loyaltyTier === 'Platinum' ? 'Max tier reached!' : 
                `${nextThreshold - loyaltyPoints} pts to ${nextTierName}`}
             </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center pt-2">
            <Progress value={progressPercentage} className="w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>My Wallet</CardTitle>
                <CardDescription>View your transaction history, manage bonds and your smart wallet.</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/customer/wallet" passHref>
                    <Button>
                        Go to Wallet <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>My Mukando</CardTitle>
                <CardDescription>Status of your savings groups.</CardDescription>
            </CardHeader>
            <CardContent>
                {isMukandoLoading ? (
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="h-6 w-6 bg-muted rounded animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                        </div>
                    </div>
                ) : mukandoGroup ? (
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <Users className="h-6 w-6 text-primary" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{mukandoGroup.goal_name}</p>
                            <p className="text-sm text-muted-foreground">
                                {mukandoGroup.progressPercentage}% complete • {mukandoGroup.memberCount} members
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatPointsAsCurrency(mukandoGroup.total_mukando_points)} / {formatPointsAsCurrency(mukandoGroup.goal_points_required)}
                            </p>
                        </div>
                        <Link href="/customer/mukando" passHref>
                            <Button variant="outline" size="sm">View</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <Users className="h-6 w-6 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">No Active Groups</p>
                            <p className="text-sm text-muted-foreground">Join a Mukando group to start saving together</p>
                        </div>
                        <Link href="/customer/mukando" passHref>
                            <Button variant="outline" size="sm">Browse</Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Badges</CardTitle>
          <CardDescription>
            {badges.length > 0 
              ? `You've earned ${badges.length} badge${badges.length === 1 ? '' : 's'}! Keep exploring to unlock more.`
              : "Complete activities to earn your first badges."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {badges.slice(0, 6).map((badge, index) => {
                // Get the Lucide icon component
                const IconComponent = (LucideIcons as any)[badge.icon] || LucideIcons.Award;
                
                return (
                  <div 
                    key={badge.id} 
                    className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 min-w-[120px] group hover:scale-105 transition-transform cursor-pointer"
                    title={`${badge.name} - ${badge.description}`}
                  >
                    <div className="relative">
                      <IconComponent className="h-8 w-8 text-yellow-600" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="text-xs font-medium text-center text-gray-700 line-clamp-2">{badge.name}</span>
                    <span className="text-xs text-yellow-600 font-semibold">+{badge.points_reward} pts</span>
                  </div>
                );
              })}
              {badges.length > 6 && (
                <div className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg bg-muted/50 min-w-[120px]">
                  <div className="text-lg font-bold text-muted-foreground">+{badges.length - 6}</div>
                  <span className="text-xs text-muted-foreground text-center">More badges</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
              <div className="space-y-2">
                <Trophy className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-sm">No badges earned yet</p>
                <p className="text-xs">Complete activities like following businesses, making transactions, or joining Mukando groups to earn your first badges!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <SmartDashboard 
        customerProfile={{
          name: profile?.full_name || '',
          loyaltyPoints: loyaltyPoints,
          tier: loyaltyTier
        }}
      />
    </div>
  );
}
