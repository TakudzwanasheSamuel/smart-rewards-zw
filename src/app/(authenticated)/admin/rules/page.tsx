"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const FormSchema = z.object({
  pointsPerPurchase: z.coerce.number().min(0, "Must be non-negative"),
  pointsPerReferral: z.coerce.number().min(0, "Must be non-negative"),
  tierName: z.string().min(1, "Tier name is required"),
  pointsToReach: z.coerce.number().min(1, "Must be greater than 0"),
});

export default function RulesPage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pointsPerPurchase: 1,
      pointsPerReferral: 100,
      tierName: "Platinum",
      pointsToReach: 5000,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "Rules Saved!",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Loyalty Rules</h1>
      <Tabs defaultValue="points" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="points">Points Earning</TabsTrigger>
          <TabsTrigger value="tiers">Tiers & Milestones</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="mukando">Mukando</TabsTrigger>
        </TabsList>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="points">
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
                        <FormDescription>Points awarded for every dollar spent.</FormDescription>
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
                         <FormDescription>Points awarded when a new customer signs up with a referral code.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tiers">
                 <Card>
                    <CardHeader>
                        <CardTitle>Tiers & Milestones</CardTitle>
                        <CardDescription>Set up loyalty tiers to reward your best customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="tierName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tier Name</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Platinum" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pointsToReach"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Points required to reach</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="5000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormItem>
                            <FormLabel>Tier Reward</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., 10% off all purchases" />
                            </FormControl>
                             <FormDescription>Describe the reward unlocked at this tier.</FormDescription>
                        </FormItem>
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="offers">
                <Card>
                    <CardHeader>
                        <CardTitle>Create an Offer</CardTitle>
                        <CardDescription>Design and manage special offers for your customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormItem>
                            <FormLabel>Offer Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Weekend Special" />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Offer Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Get 2-for-1 on all coffees" />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Points Cost (optional)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 100" />
                            </FormControl>
                             <FormDescription>If this offer can be redeemed with points.</FormDescription>
                        </FormItem>
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="mukando">
                <Card>
                    <CardHeader>
                        <CardTitle>Set Up a Mukando Group</CardTitle>
                        <CardDescription>Define the rules for a new savings group.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormItem>
                            <FormLabel>Group Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Q3 Savings Circle" />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Contribution Amount ($)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 20" />
                            </FormControl>
                             <FormDescription>The fixed amount each member contributes per cycle.</FormDescription>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Number of Members</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 10" />
                            </FormControl>
                        </FormItem>
                    </CardContent>
                </Card>
            </TabsContent>
            <Button type="submit">Save All Rules</Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
