"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyLocation } from "@/ai/flows/verify-location";

export default function CheckInButton() {
  const { toast } = useToast();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isNearby, setIsNearby] = useState(false);
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      // For this prototype, we'll just simulate being nearby after a delay.
      // In a real app, you would use navigator.geolocation.getCurrentPosition
      // to get the user's actual location.
      setTimeout(() => {
        setIsNearby(true);
        setIsLocating(false);
      }, 2000); // Simulate a 2-second location check
    } else {
      setIsLocating(false);
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      // In a real app, you'd pass real coordinates.
      const result = await verifyLocation({ latitude: -17.8252, longitude: 31.0335 });
      if (result.isVerified) {
        toast({
          title: "Check-In Successful!",
          description: `You've earned ${result.pointsAwarded} points at ${result.businessName}.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Check-In Failed",
          description: "We couldn't verify your location. Please make sure you are inside the business premises.",
        });
      }
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while trying to check in.",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handleCheckIn}
      disabled={!isNearby || isCheckingIn || isLocating}
    >
      {isLocating ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Finding Location...
        </>
      ) : isCheckingIn ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <MapPin className="mr-2 h-5 w-5" />
          Check In
        </>
      )}
    </Button>
  );
}
