
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-is-mobile";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function MapPage() {
    const isMobile = useIsMobile();
    
    // Dynamically import the MapView component to ensure it's only rendered on the client side.
    // Leaflet is not SSR-compatible.
    const MapView = useMemo(() => dynamic(() => import('@/components/customer/map-view'), {
        ssr: false,
        loading: () => <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center"><p>Loading map...</p></div>
    }), []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Nearby Offers</h1>
      <Card className="flex-grow">
        <CardHeader>
          <CardTitle>Explore Businesses Around You</CardTitle>
          <CardDescription>Find participating businesses and see their exclusive location-based offers.</CardDescription>
        </CardHeader>
        <CardContent className="h-[calc(100%-80px)]">
            <MapView />
        </CardContent>
      </Card>
    </div>
  );
}
