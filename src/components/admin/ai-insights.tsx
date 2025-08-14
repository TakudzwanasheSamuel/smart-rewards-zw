"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { predictChurn, PredictChurnOutput } from "@/ai/flows/predict-churn";
import { summarizeFeedback, SummarizeFeedbackOutput } from "@/ai/flows/summarize-feedback";
import { AlertTriangle, MessageSquareQuote, BotMessageSquare, ThumbsDown, ThumbsUp, Meh } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

function ChurnPrediction() {
    const [churnData, setChurnData] = useState<PredictChurnOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function runPrediction() {
            setIsLoading(true);
            const result = await predictChurn({ customerId: 'CUST-5678' });
            setChurnData(result);
            setIsLoading(false);
        }
        // Mock delay
        setTimeout(runPrediction, 1000);
    }, []);

    if (isLoading) {
        return <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
        </div>
    }

    if (!churnData) return <p>Could not load churn prediction.</p>;

    return <div className="space-y-3">
        <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h4 className="font-semibold">High-Risk Customer</h4>
        </div>
        <p className="text-sm"><span className="font-medium">Risk Score:</span> <Badge variant="destructive">{churnData.riskScore.toFixed(2)}</Badge></p>
        <div>
            <h5 className="text-sm font-medium mb-1">Reasons:</h5>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {churnData.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
            </ul>
        </div>
         <div>
            <h5 className="text-sm font-medium mb-1">Suggested Actions:</h5>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {churnData.suggestedActions.map((action, i) => <li key={i}>{action}</li>)}
            </ul>
        </div>
    </div>
}

function FeedbackSummary() {
    const [feedbackData, setFeedbackData] = useState<SummarizeFeedbackOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        async function runSummarization() {
            setIsLoading(true);
            const result = await summarizeFeedback({ feedback: "The app is a bit slow on startup, but I love the new Mukando feature! It's very easy to use and I've already joined a group. The personalized offers are also getting better." });
            setFeedbackData(result);
            setIsLoading(false);
        }
        // Mock delay
        setTimeout(runSummarization, 1500);
    }, []);

    if (isLoading) {
        return <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
        </div>
    }
    
    if (!feedbackData) return <p>Could not load feedback summary.</p>;

    const sentimentIcon = {
        positive: <ThumbsUp className="h-5 w-5 text-green-500" />,
        negative: <ThumbsDown className="h-5 w-5 text-red-500" />,
        neutral: <Meh className="h-5 w-5 text-yellow-500" />,
    }[feedbackData.sentiment.toLowerCase()] || <MessageSquareQuote className="h-5 w-5 text-muted-foreground" />;

    return <div className="space-y-3">
        <div className="flex items-center gap-2">
            {sentimentIcon}
            <h4 className="font-semibold capitalize">{feedbackData.sentiment} Feedback Summary</h4>
        </div>
         <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md border">{feedbackData.summary}</p>
    </div>
}

export default function AiInsights() {
    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <BotMessageSquare className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>AI Insights</CardTitle>
                        <CardDescription>Real-time analysis & predictions.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="churn">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="churn">Churn</TabsTrigger>
                        <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    </TabsList>
                    <TabsContent value="churn" className="pt-4">
                        <ChurnPrediction />
                    </TabsContent>
                    <TabsContent value="feedback" className="pt-4">
                        <FeedbackSummary />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
