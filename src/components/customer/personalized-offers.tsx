"use client";

import { useState, useEffect } from "react";
import { getPersonalizedOffers, PersonalizedOffersOutput } from "@/ai/flows/personalized-offers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Tag } from "lucide-react";

function OfferSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    );
}


export default function PersonalizedOffers() {
    const [offers, setOffers] = useState<PersonalizedOffersOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOffers() {
            try {
                setIsLoading(true);
                // In a real app, customerId and preferences would be dynamic
                const result = await getPersonalizedOffers({
                    customerId: 'CUST-12345',
                    preferences: ['fast food', 'retail'],
                    location: 'Harare, Zimbabwe',
                });
                setOffers(result);
            } catch (e) {
                setError("Could not fetch personalized offers at this time.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }

        // Mock AI call with a delay
        setTimeout(fetchOffers, 1500);
    }, []);

    if (isLoading) {
        return (
             <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <OfferSkeleton />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!offers || offers.offers.length === 0) {
        return <p>No personalized offers available right now.</p>;
    }

    return (
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-full"
        >
            <CarouselContent>
                {offers.offers.map((offer) => (
                    <CarouselItem key={offer.offerId} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <Card className="h-full">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">{offer.businessName}</CardTitle>
                                            <CardDescription className="flex items-center text-xs pt-1">
                                               <MapPin className="h-3 w-3 mr-1" /> {offer.location}
                                            </CardDescription>
                                        </div>
                                         <div className="flex items-center gap-1.5 bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-bold">
                                            <Tag className="h-3 w-3" /> {offer.discount}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    );
}
