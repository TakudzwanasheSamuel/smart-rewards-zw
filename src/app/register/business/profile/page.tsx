import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";

export default function BusinessProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="mx-auto max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Complete Your Business Profile</CardTitle>
          <CardDescription>
            Add details about your business to help customers find you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Business Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <Button variant="outline" asChild>
                <label htmlFor="logo-upload-input">
                  Upload Logo
                  <input id="logo-upload-input" type="file" className="sr-only" />
                </label>
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Physical Address</Label>
            <Textarea id="address" placeholder="123 Main Street, Harare, Zimbabwe" />
          </div>

          <div className="space-y-2">
            <Label>Geo-location</Label>
             <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden relative">
             <Image 
                src="https://placehold.co/1200x600.png" 
                alt="Map for pinning business location" 
                layout="fill"
                objectFit="cover"
                data-ai-hint="map location"
                className="opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <Button>Pin Location on Map</Button>
            </div>
          </div>
          </div>
            
          <Link href="/register/business/loyalty-setup" passHref>
            <Button type="submit" className="w-full" size="lg">
              Save and Continue
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
