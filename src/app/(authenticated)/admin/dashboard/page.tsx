import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AiInsights from "@/components/admin/ai-insights";
import { Users, Star, BarChart, PlusCircle, UserCog, Gift } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold font-headline tracking-tight">Admin Dashboard</h1>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+180 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points Redeemed</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">54,321</div>
            <p className="text-xs text-muted-foreground">+2,000 in last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Churn Risk</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">12%</div>
            <p className="text-xs text-muted-foreground">AI-powered prediction</p>
          </CardContent>
        </Card>
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
            <AiInsights />
        </div>
      </div>
    </div>
  );
}
