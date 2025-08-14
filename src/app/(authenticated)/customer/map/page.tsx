
"use client";

import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { useMemo } from "react";

// Dynamically import the MapView component to ensure it's only rendered on the client side.
// Leaflet is not SSR-compatible.
const MapView = dynamic(() => import('@/components/customer/map-view'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center"><p>Loading map...</p></div>
});

export default function MapPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Nearby Offers</h1>
      <div className="flex-grow h-[calc(100vh-150px)]">
        <Card className="h-full w-full">
            <CardContent className="h-full w-full p-0">
                <MapView />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
