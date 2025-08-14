import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default function MapPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Nearby Offers</h1>
      <Card>
        <CardHeader>
          <CardTitle>Explore Businesses Around You</CardTitle>
          <CardDescription>Find participating businesses and see their exclusive location-based offers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden relative">
             <Image 
                src="https://placehold.co/1200x600.png" 
                alt="Map of Harare showing business locations" 
                layout="fill"
                objectFit="cover"
                data-ai-hint="map harare"
                className="opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-semibold text-background bg-foreground/50 px-4 py-2 rounded-md">Map View Coming Soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
