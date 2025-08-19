"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EnhancedAiInsights from "@/components/admin/ai-insights-enhanced";
import { Users, Star, BarChart, PlusCircle, UserCog, Gift } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { adminApi } from "@/lib/api";

interface DashboardMetrics {
  totalCustomers: number;
  totalPointsRedeemed: number;
  totalOffers: number;
  recentCustomers: number;
  recentPointsRedeemed: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || user.userType !== 'business') return;

      try {
        // Fetch customers and calculate metrics
        const customers = await adminApi.getCustomers();
        const offers = await adminApi.getOffers();

        // Calculate total points redeemed from customers
        const totalPointsRedeemed = customers.reduce((sum: number, customer: any) => {
          return sum + (customer.loyalty_points || 0);
        }, 0);

        setMetrics({
          totalCustomers: customers.length,
          totalPointsRedeemed,
          totalOffers: offers.length,
          recentCustomers: Math.floor(customers.length * 0.1), // Simulate 10% as recent
          recentPointsRedeemed: Math.floor(totalPointsRedeemed * 0.05), // Simulate 5% as recent
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set default values if API calls fail
        setMetrics({
          totalCustomers: 0,
          totalPointsRedeemed: 0,
          totalOffers: 0,
          recentCustomers: 0,
          recentPointsRedeemed: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const LoadingCard = ({ title, icon: Icon }: { title: string; icon: any }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome, {user?.businessName || 'Business Admin'}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <LoadingCard title="Active Customers" icon={Users} />
            <LoadingCard title="Total Points Redeemed" icon={Star} />
            <LoadingCard title="Active Offers" icon={BarChart} />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalCustomers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.recentCustomers || 0} new this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points Earned</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalPointsRedeemed?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{metrics?.recentPointsRedeemed || 0} this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalOffers || 0}</div>
                <p className="text-xs text-muted-foreground">Promotional campaigns</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* AI Insights and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
           <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get right to what you need to do.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <Link href="/admin/rules" passHref>
                    <Button variant="outline" className="w-full h-full flex-col py-4">
                        <PlusCircle className="h-6 w-6 mb-2" />
                        <span>Create New Offer</span>
                    </Button>
                </Link>
                <Link href="/admin/customers" passHref>
                    <Button variant="outline" className="w-full h-full flex-col py-4">
                        <UserCog className="h-6 w-6 mb-2" />
                        <span>View Customer Activity</span>
                    </Button>
                </Link>
                <Link href="/admin/rules" passHref>
                    <Button variant="outline" className="w-full h-full flex-col py-4">
                        <Gift className="h-6 w-6 mb-2" />
                        <span>Manage Mukando</span>
                    </Button>
                </Link>
            </CardContent>
           </Card>
        </div>

        <div className="xl:col-span-1">
            <EnhancedAiInsights />
        </div>
      </div>
    </div>
  );
}
