import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Leaf, Wallet, Users, ArrowRight, Award, Trophy } from "lucide-react";
import Link from "next/link";
import PersonalizedOffers from "@/components/customer/personalized-offers";

const badges = [
  { icon: Trophy, label: "Mukando Starter" },
  { icon: Award, label: "Eco-Warrior" },
]

export default function CustomerDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">Welcome Back!</h1>
          <p className="text-muted-foreground">Here&apos;s your loyalty summary.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,530</div>
            <p className="text-xs text-muted-foreground">Equivalent to $12.53</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eco-Points</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">850</div>
            <p className="text-xs text-muted-foreground">Making a green difference!</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Tier: Gold</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-xs text-muted-foreground mb-2">You are 470 points away from Platinum</div>
            <Progress value={100 * (2530 / 3000)} className="w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card>
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
                <CardDescription>Check the status of your savings groups.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Users className="h-6 w-6 text-primary" />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Harare Techies Round</p>
                        <p className="text-sm text-muted-foreground">Next payout: 15 July 2024</p>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Badges</CardTitle>
          <CardDescription>Collect badges for your achievements in the ecosystem.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-card-foreground/5">
              <badge.icon className="h-8 w-8 text-secondary" />
              <span className="text-xs font-medium text-center">{badge.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-xl font-bold font-headline tracking-tight">Personalized For You</h2>
        <p className="text-muted-foreground mb-4">AI-powered recommendations based on your preferences.</p>
        <PersonalizedOffers />
      </div>
    </div>
  );
}
