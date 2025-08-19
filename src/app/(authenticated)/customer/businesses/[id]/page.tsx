
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, ShieldQuestion, UserPlus, UserMinus, Users, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { customerApi, offersApi } from "@/lib/api";
import { formatPointsAsCurrency, getPointsDisplayText } from "@/lib/currency";
import { RedemptionDialog } from "@/components/customer/redemption-dialog";
import CreateMukandoDialog from "@/components/customer/create-mukando-dialog";


interface Business {
  user_id: string;
  business_name: string;
  business_category?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
}

interface Offer {
  id: string;
  offer_name: string;
  description?: string;
  points_required?: number;
  reward_type: string;
  is_coupon: boolean;
  discount_code?: string;
  active_from?: string;
  active_to?: string;
  business_id: string;
}

export default function BusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInMukando, setIsInMukando] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isRedemptionDialogOpen, setIsRedemptionDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        const businessId = resolvedParams.id;
        console.log('📋 Fetching business data for ID:', businessId);
        
        // Fetch business details, offers, and follow status in parallel
        const [businessData, offersData, followStatus] = await Promise.all([
          customerApi.getBusiness(businessId),
          offersApi.getBusinessOffers(businessId),
          customerApi.isFollowingBusiness(businessId).catch(() => ({ isFollowing: false }))
        ]);

        console.log('✅ Business data:', businessData);
        console.log('✅ Offers data:', offersData);
        console.log('✅ Follow status:', followStatus);

        setBusiness(businessData);
        setOffers(offersData);
        setIsFollowing(followStatus.isFollowing);
      } catch (error) {
        console.error('❌ Failed to fetch business data:', error);
        toast({
          title: "Error",
          description: "Failed to load business information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params, toast]);

  const handleToggleFollow = async () => {
    if (!business) return;
    
    const resolvedParams = await params;
    const businessId = resolvedParams.id;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await customerApi.unfollowBusiness(businessId);
        setIsFollowing(false);
        toast({
          title: `You are no longer following ${business.business_name}`,
          description: "You won't receive their exclusive updates.",
        });
      } else {
        const followResult = await customerApi.followBusiness(businessId);
        setIsFollowing(true);
        const pointsEarned = followResult.pointsAwarded || 1;
        const pointsText = getPointsDisplayText(pointsEarned);
        toast({
          title: `You are now following ${business.business_name}!`,
          description: `You earned ${pointsText} for following! You'll now see their offers on your dashboard.`,
        });
      }
    } catch (error) {
      console.error('❌ Follow/unfollow error:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleJoinMukando = async () => {
    if (!business) return;
    
    // For now, we'll use a default group ID. In a real implementation, 
    // you'd fetch available groups for this business
    const defaultGroupId = "default-group-id";
    
    try {
      const result = await customerApi.joinMukandoGroup(defaultGroupId);
      setIsInMukando(true);
      const pointsEarned = result.pointsAwarded || 1;
      const pointsText = getPointsDisplayText(pointsEarned);
      toast({
        title: `You've joined the Mukando group!`,
        description: `You earned ${pointsText} for joining! Your contributions will now be tracked.`,
      });
    } catch (error) {
      console.error('❌ Failed to join Mukando group:', error);
      toast({
        title: "Error",
        description: "Failed to join Mukando group. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleRedeemOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsRedemptionDialogOpen(true);
  };

  const handleRedemptionSuccess = () => {
    // Optionally refresh user profile or offers data
    console.log('✅ Redemption completed successfully');
  };

  if (isLoading) {
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
            <Skeleton className="h-24 w-24 rounded-lg" />
            <div className="flex-grow space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-40 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Link href="/customer/businesses" passHref>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Businesses
          </Button>
        </Link>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Business Not Found</h3>
            <p className="text-muted-foreground text-center">
              The business you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="h-24 w-24 bg-primary/10 rounded-lg flex items-center justify-center">
            <Store className="h-12 w-12 text-primary" />
          </div>
          <div className="flex-grow">
            <CardTitle className="text-3xl font-headline">{business.business_name}</CardTitle>
            <CardDescription className="flex items-center gap-4 pt-2">
              <Badge variant="secondary">{business.business_category || "General Business"}</Badge>
              <span className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1.5" />
                {business.latitude && business.longitude ? "Location available" : "Contact for location"}
              </span>
            </CardDescription>
          </div>
          <Button 
            variant={isFollowing ? "destructive" : "default"} 
            onClick={handleToggleFollow}
            disabled={isFollowLoading}
          >
            {isFollowLoading ? (
              <>Loading...</>
            ) : (
              <>
                {isFollowing ? <UserMinus className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isFollowing ? "Unfollow Business" : "Follow Business"}
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex items-center p-3 flex-grow bg-muted rounded-lg text-sm">
                    <ShieldQuestion className="h-5 w-5 mr-3 text-primary" />
                    <span className="font-medium text-muted-foreground">Earn points with every purchase at {business.business_name}</span>
                </div>
                <div className="flex items-center p-3 flex-grow bg-muted rounded-lg text-sm">
                    <Users className="h-5 w-5 mr-3 text-primary" />
                    <div className="flex-grow">
                        <span className="font-medium text-muted-foreground">Start a community savings group with this business</span>
                    </div>
                    <div className="ml-3">
                        <CreateMukandoDialog 
                            businessId={business.user_id} 
                            businessName={business.business_name} 
                        />
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold font-headline mb-4">Active Offers</h2>
            {offers.length === 0 ? (
              <div className="text-center py-12">
                <ShieldQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Offers</h3>
                <p className="text-muted-foreground">
                  This business hasn't created any offers yet. Follow them to be notified when new offers are available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.map(offer => (
                  <Card key={offer.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">{offer.offer_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">{offer.description || "No description available"}</p>
                      {offer.is_coupon && offer.discount_code && (
                        <div className="mt-3 p-2 bg-primary/10 rounded text-xs">
                          <span className="font-semibold">Coupon Code: </span>
                          <code className="bg-white/50 px-1 rounded">{offer.discount_code}</code>
                        </div>
                      )}
                    </CardContent>
                    <div className="p-6 pt-0 flex justify-between items-center">
                      <div className="text-primary">
                        {offer.points_required && offer.points_required > 0 ? (
                          <>
                            <div className="text-lg font-bold">{offer.points_required} pts</div>
                            <div className="text-xs text-muted-foreground">
                              {formatPointsAsCurrency(offer.points_required)}
                            </div>
                          </>
                        ) : (
                          <div className="text-lg font-bold">Free</div>
                        )}
                      </div>
                      <Button onClick={() => handleRedeemOffer(offer)}>
                        Redeem
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
        </CardContent>
      </Card>

      {/* Redemption Dialog */}
      <RedemptionDialog
        isOpen={isRedemptionDialogOpen}
        onClose={() => setIsRedemptionDialogOpen(false)}
        offer={selectedOffer}
        business={business}
        onRedemptionSuccess={handleRedemptionSuccess}
      />
    </div>
  );
}
