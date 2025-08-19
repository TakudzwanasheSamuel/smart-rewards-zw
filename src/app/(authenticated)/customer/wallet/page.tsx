"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownLeft, ArrowUpRight, Repeat, Landmark, ShieldCheck, HandCoins } from "lucide-react";
import { customerApi } from "@/lib/api";
import { formatPointsAsCurrency } from "@/lib/currency";
import { useAuth } from "@/contexts/auth-context";

interface Transaction {
  id: string;
  type: 'earn' | 'redeem';
  description: string;
  amount: string;
  points: number;
  date: string;
  businessName?: string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user || user.userType !== 'customer') return;

      try {
        const transactionsData = await customerApi.getTransactions();
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        // Set empty array on error instead of crashing
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">My Wallet</h1>
      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">Point History</TabsTrigger>
          <TabsTrigger value="bonds">Loyalty Bonds</TabsTrigger>
          <TabsTrigger value="smart-wallet">Smart Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>A log of all your points earned and redeemed.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Skeleton className="h-4 w-4 mr-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-6 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No transactions yet. Start earning points by shopping at partner businesses!
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium flex items-center">
                          {tx.type === "earn" ? <ArrowDownLeft className="h-4 w-4 mr-2 text-green-500" /> : <ArrowUpRight className="h-4 w-4 mr-2 text-red-500" />}
                          {tx.description}
                        </TableCell>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={tx.type === 'earn' ? 'secondary' : 'destructive'} className="text-xs">{tx.amount}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bonds">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Bonds</CardTitle>
              <CardDescription>View and manage your converted loyalty bonds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                 <div className="flex items-center space-x-3">
                    <div className="bg-primary/20 p-2 rounded-full"><Landmark className="h-5 w-5 text-primary" /></div>
                    <div>
                        <p className="font-semibold">5-Year Loyalty Bond</p>
                        <p className="text-sm text-muted-foreground">Matures: 2029-01-01</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">5,000 pts</p>
                    <p className="text-sm text-muted-foreground">Est. Value: $65.00</p>
                </div>
              </div>
              <div className="text-center text-muted-foreground">
                <p>No other active bonds. Convert points to bonds for long-term value.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="smart-wallet">
            <Card>
                <CardHeader>
                    <CardTitle>Smart Wallet Features</CardTitle>
                    <CardDescription>Utilize your points in innovative ways.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                   <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                           <Repeat className="h-8 w-8 text-accent"/>
                           <CardTitle className="text-lg">Skill-Swap</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Use your points to exchange skills and services with others in the community. Your points balance acts as a measure of trust and activity.</p>
                        </CardContent>
                   </Card>
                   <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                           <ShieldCheck className="h-8 w-8 text-accent"/>
                           <CardTitle className="text-lg">Trust Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Your engagement and points history contribute to a Trust Score, unlocking potential for micro-lending opportunities within the ecosystem.</p>
                        </CardContent>
                   </Card>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
