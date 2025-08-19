"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { adminApi } from "@/lib/api";

const RulesMapView = dynamic(() => import('@/components/admin/rules-map-view'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center"><p>Loading map...</p></div>
});


const FormSchema = z.object({
  pointsPerPurchase: z.coerce.number().min(0, "Must be non-negative"),
  pointsPerReferral: z.coerce.number().min(0, "Must be non-negative"),
  pointsPerCheckIn: z.coerce.number().min(0, "Must be non-negative"),
  tierName: z.string().min(1, "Tier name is required"),
  pointsToReach: z.coerce.number().min(1, "Must be greater than 0"),
});

const OfferSchema = z.object({
  offer_name: z.string().min(1, "Offer name is required"),
  description: z.string().min(1, "Description is required"),
  points_required: z.coerce.number().min(0, "Points must be non-negative"),
  reward_type: z.string(),
  active_from: z.string().optional(),
  active_to: z.string().optional(),
});

interface LoyaltyRule {
  id: string;
  rule_type: string;
  rule_json: any;
}

interface Offer {
  id: string;
  offer_name: string;
  description: string;
  points_required: number;
  reward_type: string;
  active_from?: string;
  active_to?: string;
  created_at: string;
}

interface MukandoGroup {
  id: string;
  group_name: string;
  total_pot: number;
  current_payout_user_id?: string;
}

export default function RulesPage() {
  const { user } = useAuth();
  const [loyaltyRules, setLoyaltyRules] = useState<LoyaltyRule[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [mukandoGroups, setMukandoGroups] = useState<MukandoGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pointsPerPurchase: 1,
      pointsPerReferral: 100,
      pointsPerCheckIn: 10,
      tierName: "Platinum",
      pointsToReach: 5000,
    },
  });

  const offerForm = useForm<z.infer<typeof OfferSchema>>({
    resolver: zodResolver(OfferSchema),
    defaultValues: {
      offer_name: "",
      description: "",
      points_required: 0,
      reward_type: "monetary",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.userType !== 'business') return;

      try {
        const [rulesData, offersData, mukandoData] = await Promise.all([
          adminApi.getRules(),
          adminApi.getOffers(),
          adminApi.getMukandoGroups(),
        ]);

        setLoyaltyRules(rulesData);
        setOffers(offersData);
        setMukandoGroups(mukandoData);

        // Load existing rules into form if available
        const pointsRule = rulesData.find((rule: LoyaltyRule) => rule.rule_type === 'points');
        if (pointsRule) {
          const ruleData = pointsRule.rule_json;
          form.setValue('pointsPerPurchase', ruleData.pointsPerPurchase || 1);
          form.setValue('pointsPerReferral', ruleData.pointsPerReferral || 100);
          form.setValue('pointsPerCheckIn', ruleData.pointsPerCheckIn || 10);
        }
      } catch (error) {
        console.error('Failed to fetch rules data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load rules data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, form, toast]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    try {
      await adminApi.createRule('points', {
        pointsPerPurchase: data.pointsPerPurchase,
        pointsPerReferral: data.pointsPerReferral,
        pointsPerCheckIn: data.pointsPerCheckIn,
      });

      await adminApi.createRule('tier', {
        tierName: data.tierName,
        pointsToReach: data.pointsToReach,
      });

      toast({
        title: "Rules Saved!",
        description: "Your loyalty rules have been updated successfully.",
      });

      // Refresh rules data
      const rulesData = await adminApi.getRules();
      setLoyaltyRules(rulesData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save rules. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onOfferSubmit(data: z.infer<typeof OfferSchema>) {
    console.log('🚀 Starting offer creation process...');
    console.log('📝 Form data received:', data);
    
    setIsSubmitting(true);
    try {
      // Detailed authentication check
      const token = localStorage.getItem('smart_rewards_token');
      console.log('🔑 Token check:', {
        tokenExists: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
      });
      
      console.log('👤 User context:', {
        userExists: !!user,
        userType: user?.userType,
        userId: user?.id,
        businessName: user?.businessName
      });

      // Validate form data
      console.log('✅ Form validation:', {
        offer_name: data.offer_name,
        description: data.description,
        points_required: data.points_required,
        reward_type: data.reward_type
      });

      if (!data.offer_name || !data.description) {
        throw new Error('Missing required fields: offer_name or description');
      }

      console.log('📡 Making API call to create offer...');
      const result = await adminApi.createOffer(data);
      console.log('✅ Offer creation successful:', result);

      toast({
        title: "Offer Created!",
        description: "Your new offer has been created successfully.",
      });

      // Refresh offers data
      console.log('🔄 Refreshing offers list...');
      const offersData = await adminApi.getOffers();
      console.log('📊 Updated offers:', offersData);
      setOffers(offersData);
      offerForm.reset();
      console.log('🎉 Offer creation process completed successfully!');
      
    } catch (error: any) {
      console.error('❌ Offer creation failed:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('🔒 Authentication error detected, redirecting to login...');
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Your session may have expired. Please log in again.",
        });
        
        // Clear expired token
        localStorage.removeItem('smart_rewards_token');
        localStorage.removeItem('smart_rewards_user');
        window.location.href = '/login';
      } else {
        console.log('⚠️ General error, showing error message to user');
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to create offer. Please try again.",
        });
      }
    } finally {
      console.log('🏁 Offer creation process ended, resetting loading state');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Loyalty Engine Configuration</h1>
      <Tabs defaultValue="points" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="tiers">Tiers & Milestones</TabsTrigger>
          <TabsTrigger value="offers">Offers & Campaigns</TabsTrigger>
          <TabsTrigger value="mukando">Mukando Manager</TabsTrigger>
        </TabsList>
            <TabsContent value="points">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Points Earning Rules</CardTitle>
                      <CardDescription>Define how customers earn points from transactions and engagement.</CardDescription>
                    </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pointsPerPurchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points per $1 spent</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pointsPerReferral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points per successful referral</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pointsPerCheckIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points per check-in</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Points Rules"}
              </Button>
            </form>
          </Form>
        </TabsContent>
            
            <TabsContent value="tiers">
                 <Card>
                    <CardHeader>
                        <CardTitle>Tiers & Milestones</CardTitle>
                        <CardDescription>Set up loyalty tiers to reward your best customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4">
                          <Label className="text-sm font-medium">Bronze Tier</Label>
                          <Input className="mt-2" placeholder="e.g., 0 Points" />
                          <Textarea className="mt-2" placeholder="e.g., Welcome bonus" />
                        </Card>
                        <Card className="p-4 border-primary">
                          <Label className="text-sm font-medium">Silver Tier</Label>
                          <Input className="mt-2" placeholder="e.g., 1000 Points" />
                          <Textarea className="mt-2" placeholder="e.g., 5% off" />
                        </Card>
                         <Card className="p-4">
                          <Label className="text-sm font-medium">Gold Tier</Label>
                          <Input className="mt-2" placeholder="e.g., 5000 Points" />
                          <Textarea className="mt-2" placeholder="e.g., 10% off + free item" />
                        </Card>
                      </div>
                      <Button variant="outline">Add New Tier</Button>
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="offers">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Offer</CardTitle>
                      <CardDescription>Design special offers for your customers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...offerForm}>
                        <form onSubmit={offerForm.handleSubmit(onOfferSubmit)} className="space-y-4">
                          <FormField
                            control={offerForm.control}
                            name="offer_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Offer Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Weekend Special" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={offerForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Describe your offer..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={offerForm.control}
                            name="points_required"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Points Required</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormDescription>Points needed to redeem this offer (0 for free offers)</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={offerForm.control}
                            name="reward_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reward Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select reward type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="monetary">Monetary Discount</SelectItem>
                                    <SelectItem value="experiential">Experience/Service</SelectItem>
                                    <SelectItem value="product">Free Product</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Offer"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Active Offers</CardTitle>
                      <CardDescription>Your current promotional offers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="border rounded-lg p-3">
                              <Skeleton className="h-4 w-3/4 mb-2" />
                              <Skeleton className="h-3 w-full mb-1" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          ))}
                        </div>
                      ) : offers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No offers created yet.</p>
                          <p className="text-sm">Create your first offer to get started!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {offers.map((offer) => (
                            <div key={offer.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{offer.offer_name}</h4>
                                <Badge variant="outline">{offer.reward_type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{offer.description}</p>
                              <div className="flex justify-between items-center text-xs">
                                <span>{offer.points_required} points required</span>
                                <span>Created {new Date(offer.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
            </TabsContent>

             <TabsContent value="mukando">
                <div className="grid gap-6">
                  <Card>
                      <CardHeader>
                          <CardTitle>Create New Mukando Group</CardTitle>
                          <CardDescription>Launch a new savings group for your customers.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="group-name">Group Name</Label>
                              <Input id="group-name" placeholder="e.g., Q4 Festive Fund" />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="contribution-amount">Contribution Amount ($)</Label>
                              <Input id="contribution-amount" type="number" placeholder="e.g., 20" />
                              <p className="text-sm text-muted-foreground">The fixed amount each member contributes per cycle.</p>
                          </div>
                          <Button>Create New Group</Button>
                      </CardContent>
                  </Card>
                  <Card>
                      <CardHeader>
                          <CardTitle>Manage Active Groups</CardTitle>
                          <CardDescription>View member lists, contributions, and payout order.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Group Name</TableHead>
                              <TableHead>Members</TableHead>
                              <TableHead>Total Pot</TableHead>
                              <TableHead>Next Payout</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoading ? (
                              Array.from({ length: 2 }).map((_, i) => (
                                <TableRow key={i}>
                                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                </TableRow>
                              ))
                            ) : mukandoGroups.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                  No Mukando groups created yet. Create your first group to get started!
                                </TableCell>
                              </TableRow>
                            ) : (
                              mukandoGroups.map((group) => (
                                <TableRow key={group.id}>
                                  <TableCell className="font-medium">{group.group_name}</TableCell>
                                  <TableCell>0 members</TableCell>
                                  <TableCell>${(group.total_pot || 0).toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">
                                      {group.current_payout_user_id ? 'Active' : 'Waiting'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                  </Card>
                </div>
            </TabsContent>
      </Tabs>
    </div>
  );
}
