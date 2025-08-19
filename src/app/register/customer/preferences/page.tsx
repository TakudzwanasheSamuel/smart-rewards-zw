"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { customerApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

const interests = [
  { id: "fast-food", label: "Fast Food & Restaurants" },
  { id: "salons", label: "Salons & Spas" },
  { id: "hardware", label: "Hardware Stores" },
  { id: "retail", label: "Retail & Shopping" },
  { id: "groceries", label: "Groceries" },
  { id: "entertainment", label: "Entertainment" },
];

export default function PreferencesPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleInterestChange = (interestId: string, checked: boolean) => {
    if (checked) {
      setSelectedInterests(prev => [...prev, interestId]);
    } else {
      setSelectedInterests(prev => prev.filter(id => id !== interestId));
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);

    try {
      await customerApi.updatePreferences(selectedInterests);
      
      toast({
        title: "Preferences saved!",
        description: `We'll personalize your experience based on your ${selectedInterests.length} selected interests.`,
      });

      // Redirect to customer dashboard
      router.push("/customer/dashboard");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save preferences. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Preferences skipped",
      description: "You can always update your preferences later in settings.",
    });
    router.push("/customer/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Personalize Your Experience</CardTitle>
          <CardDescription>
            Select your interests to get relevant offers and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <p className="text-sm font-medium">What are you interested in?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {interests.map((interest) => (
                <div key={interest.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={interest.id} 
                    checked={selectedInterests.includes(interest.id)}
                    onCheckedChange={(checked) => handleInterestChange(interest.id, checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={interest.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {interest.label}
                  </Label>
                </div>
              ))}
            </div>
            <Button 
              onClick={handleSavePreferences} 
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving preferences...
                </>
              ) : selectedInterests.length === 0 ? (
                "Continue Without Preferences"
              ) : (
                "Save Preferences & Continue"
              )}
            </Button>
            <Button 
              variant="link" 
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full"
            >
              Skip for now
            </Button>
            {selectedInterests.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
