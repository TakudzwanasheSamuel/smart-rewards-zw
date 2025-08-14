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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

const FormSchema = z.object({
  pointsPerPurchase: z.coerce.number().min(0, "Must be non-negative"),
  pointsPerReferral: z.coerce.number().min(0, "Must be non-negative"),
  pointsPerCheckIn: z.coerce.number().min(0, "Must be non-negative"),
  tierName: z.string().min(1, "Tier name is required"),
  pointsToReach: z.coerce.number().min(1, "Must be greater than 0"),
});

export default function RulesPage() {
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
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Loyalty Engine Configuration</h1>
      <Tabs defaultValue="points" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="tiers">Tiers & Milestones</TabsTrigger>
          <TabsTrigger value="offers">Offers & Campaigns</TabsTrigger>
          <TabsTrigger value="mukando">Mukando Manager</TabsTrigger>
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
                          <FormLabel>Bronze Tier</FormLabel>
                          <Input className="mt-2" placeholder="e.g., 0 Points" />
                          <Textarea className="mt-2" placeholder="e.g., Welcome bonus" />
                        </Card>
                        <Card className="p-4 border-primary">
                          <FormLabel>Silver Tier</FormLabel>
                          <Input className="mt-2" placeholder="e.g., 1000 Points" />
                          <Textarea className="mt-2" placeholder="e.g., 5% off" />
                        </Card>
                         <Card className="p-4">
                          <FormLabel>Gold Tier</FormLabel>
                          <Input className="mt-2" placeholder="e.g., 5000 Points" />
                          <Textarea className="mt-2" placeholder="e.g., 10% off + free item" />
                        </Card>
                      </div>
                      <Button variant="outline">Add New Tier</Button>
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="offers">
                <Card>
                    <CardHeader>
                        <CardTitle>Create an Offer Campaign</CardTitle>
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
                            <FormLabel>Campaign Type</FormLabel>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a campaign type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="geo">Geo-fenced</SelectItem>
                                    <SelectItem value="time">Time-based</SelectItem>
                                    <SelectItem value="event">Event-based</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                         <div className="space-y-2">
                          <Label>Geo-fence Radius</Label>
                           <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden relative">
                           <Image 
                              src="https://placehold.co/1200x600.png" 
                              alt="Map for geo-fencing" 
                              layout="fill"
                              objectFit="cover"
                              data-ai-hint="map radius"
                              className="opacity-70"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                              <Button variant="secondary">Drop Pin and Set Radius</Button>
                          </div>
                        </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="mukando">
                <Card>
                    <CardHeader>
                        <CardTitle>Mukando/maRound Manager</CardTitle>
                        <CardDescription>Create and track savings groups.</CardDescription>
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
                        <Button>Create New Group</Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <Button type="submit" className="w-full">Save All Rules</Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
