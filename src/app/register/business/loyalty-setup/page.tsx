"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Check } from "lucide-react"

const steps = [
  { id: 1, name: "Program Type" },
  { id: 2, name: "Define Rules" },
  { id: 3, name: "Initial Campaign" },
]

export default function LoyaltySetupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [programType, setProgramType] = useState("points");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="mx-auto max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Initial Loyalty Program Setup</CardTitle>
          <CardDescription>
            Get your loyalty program running in a few simple steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <ol className="flex items-center justify-between w-full">
              {steps.map((step, index) => (
                <li key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>{step.name}</span>
                  </div>
                  {index < steps.length - 1 && <div className="flex-auto border-t-2 transition-colors mx-4 ${currentStep > step.id ? 'border-primary' : 'border-muted'}"></div>}
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            {currentStep === 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Step 1: Choose Your Program Type</h3>
                <RadioGroup defaultValue="points" onValueChange={setProgramType}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Label htmlFor="points-based" className="border rounded-md p-4 hover:border-primary has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer">
                      <RadioGroupItem value="points" id="points-based" className="sr-only" />
                      <h4 className="font-semibold mb-1">Points-Based</h4>
                      <p className="text-sm text-muted-foreground">Reward customers with points for purchases and actions.</p>
                    </Label>
                    <Label htmlFor="tiers" className="border rounded-md p-4 hover:border-primary has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer">
                      <RadioGroupItem value="tiers" id="tiers" className="sr-only" />
                      <h4 className="font-semibold mb-1">Milestones & Tiers</h4>
                      <p className="text-sm text-muted-foreground">Create tiers like Bronze, Silver, Gold with increasing benefits.</p>
                    </Label>
                    <Label htmlFor="mukando" className="border rounded-md p-4 hover:border-primary has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer">
                      <RadioGroupItem value="mukando" id="mukando" className="sr-only" />
                      <h4 className="font-semibold mb-1">Mukando Group</h4>
                      <p className="text-sm text-muted-foreground">Set up a community savings group (maRound).</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {currentStep === 2 && (
              <div>
                 <h3 className="text-lg font-semibold mb-4">Step 2: Define Basic Rules</h3>
                 <div className="space-y-4">
                  {programType === 'points' && (
                    <div className="space-y-2">
                      <Label htmlFor="points-rule">Points Rule</Label>
                      <Input id="points-rule" placeholder="e.g., 1 point for every $1 spent" />
                    </div>
                  )}
                   {programType === 'tiers' && (
                    <div className="space-y-2">
                      <Label htmlFor="milestone-rule">Milestone Rule</Label>
                      <Input id="milestone-rule" placeholder="e.g., Free coffee after 5 visits" />
                    </div>
                  )}
                   {programType === 'mukando' && (
                    <div className="space-y-2">
                      <Label htmlFor="mukando-rule">Group Goal</Label>
                      <Input id="mukando-rule" placeholder="e.g., $100 per member for 10 weeks" />
                    </div>
                  )}
                 </div>
              </div>
            )}

            {currentStep === 3 && (
               <div>
                 <h3 className="text-lg font-semibold mb-4">Step 3: Create an Initial Campaign</h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="campaign-title">Campaign Title</Label>
                      <Input id="campaign-title" defaultValue="Welcome Bonus" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campaign-description">Campaign Description</Label>
                      <Textarea id="campaign-description" defaultValue="Get 50 points for signing up!" />
                    </div>
                 </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setCurrentStep(s => Math.max(1, s - 1))} disabled={currentStep === 1}>
                Back
              </Button>
               {currentStep < 3 ? (
                 <Button onClick={() => setCurrentStep(s => Math.min(3, s + 1))}>
                    Next <ArrowRight className="ml-2" />
                 </Button>
               ) : (
                <Link href="/admin/dashboard" passHref>
                    <Button>
                        Finish & Go to Dashboard <ArrowRight className="ml-2" />
                    </Button>
                </Link>
               )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
