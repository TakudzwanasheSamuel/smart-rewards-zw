
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, ShieldQuestion, UserPlus, UserMinus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";


const business = {
  id: "biz-001",
  name: "Chicken Inn",
  category: "Fast Food",
  logoUrl: "https://placehold.co/200x200.png",
  address: "123 Samora Machel Ave, Harare",
  loyaltyRule: "Earn 1 point for every $1 spent.",
};

const offers = [
  {
    id: "offer-01",
    title: "Free Side with Combo",
    description: "Purchase any combo meal and get a side of your choice for free.",
    points: 0,
  },
  {
    id: "offer-02",
    title: "2-for-1 Wings",
    description: "Redeem this offer to get two portions of wings for the price of one.",
    points: 100,
  },
  {
    id: "offer-03",
    title: "$5 Off Your Next Order",
    description: "Get $5 off when you spend $20 or more.",
    points: 250,
  },
];

export default function BusinessProfilePage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [isCustomer, setIsCustomer] = useState(false);
  const [isInMukando, setIsInMukando] = useState(false);

  const handleToggleCustomer = () => {
    setIsCustomer(!isCustomer);
    toast({
        title: isCustomer ? `You are no longer following ${business.name}` : `You are now following ${business.name}!`,
        description: isCustomer ? "You won't receive their exclusive updates." : "You'll now see their offers on your dashboard.",
    });
  }

  const handleJoinMukando = () => {
    setIsInMukando(true);
    toast({
        title: `You've joined the Mukando group!`,
        description: `Your contributions will now be tracked.`,
    });
  }

  // In a real app, you would fetch business data based on params.id
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Link href="/customer/businesses" passHref>
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Businesses
        </Button>
      </Link>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Image
            src={business.logoUrl}
            alt={`${business.name} logo`}
            width={100}
            height={100}
            className="rounded-lg border"
            data-ai-hint="business logo"
          />
          <div className="flex-grow">
            <CardTitle className="text-3xl font-headline">{business.name}</CardTitle>
            <CardDescription className="flex items-center gap-4 pt-2">
              <Badge variant="secondary">{business.category}</Badge>
              <span className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1.5" />
                {business.address}
              </span>
            </CardDescription>
          </div>
           <Button variant={isCustomer ? "destructive" : "default"} onClick={handleToggleCustomer}>
              {isCustomer ? <UserMinus className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {isCustomer ? "Unfollow Business" : "Follow Business"}
            </Button>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex items-center p-3 flex-grow bg-muted rounded-lg text-sm">
                    <ShieldQuestion className="h-5 w-5 mr-3 text-primary" />
                    <span className="font-medium text-muted-foreground">{business.loyaltyRule}</span>
                </div>
                 <div className="flex items-center p-3 flex-grow bg-muted rounded-lg text-sm">
                    <Users className="h-5 w-5 mr-3 text-primary" />
                    <div className="flex-grow">
                        <span className="font-medium text-muted-foreground">This business runs a Mukando group.</span>
                    </div>
                    <Button size="sm" onClick={handleJoinMukando} disabled={isInMukando}>
                        {isInMukando ? "Joined" : "Join Group"}
                    </Button>
                </div>
            </div>

            <h2 className="text-xl font-bold font-headline mb-4">Active Offers</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.map(offer => (
                    <Card key={offer.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg">{offer.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground">{offer.description}</p>
                        </CardContent>
                        <div className="p-6 pt-0 flex justify-between items-center">
                            <span className="text-lg font-bold text-primary">{offer.points > 0 ? `${offer.points} pts` : 'Free'}</span>
                            <Button>Redeem</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
