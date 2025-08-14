import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const interests = [
  { id: "fast-food", label: "Fast Food & Restaurants" },
  { id: "salons", label: "Salons & Spas" },
  { id: "hardware", label: "Hardware Stores" },
  { id: "retail", label: "Retail & Shopping" },
  { id: "groceries", label: "Groceries" },
  { id: "entertainment", label: "Entertainment" },
]

export default function PreferencesPage() {
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
                  <Checkbox id={interest.id} />
                  <Label
                    htmlFor={interest.id}
                    className="text-sm font-normal"
                  >
                    {interest.label}
                  </Label>
                </div>
              ))}
            </div>
            <Link href="/customer/dashboard" passHref>
              <Button type="submit" className="w-full mt-4">
                Save Preferences & Continue
              </Button>
            </Link>
             <Link href="/customer/dashboard" className="w-full text-center">
                <Button variant="link">Skip for now</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
