"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { customerAdvisorApi } from '@/lib/api';
import { 
  Sparkles, 
  Gift, 
  Store, 
  Users, 
  TrendingUp, 
  Target, 
  Star,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Heart,
  Zap,
  DollarSign,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface PersonalizedData {
  profile: {
    customerId: string;
    fullName: string;
    loyaltyPoints: number;
    loyaltyTier: string;
    ecoPoints: number;
    interests: string[];
  };
  recommendations: Array<{
    type: 'offer' | 'business' | 'mukando' | 'tier' | 'financial';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionText: string;
    expectedBenefit: string;
    category: string;
    data?: any;
  }>;
  achievementOpportunities: Array<{
    type: 'tier_upgrade' | 'milestone' | 'challenge' | 'streak';
    title: string;
    description: string;
    currentProgress: number;
    target: number;
    reward: string;
    timeframe: string;
  }>;
  financialTips: Array<{
    category: 'saving' | 'earning' | 'spending' | 'planning';
    tip: string;
    impact: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}

interface OffersData {
  activeOffers: Array<{
    offerId: string;
    businessId: string;
    businessName: string;
    offerName: string;
    description: string;
    pointsRequired: number;
    discountValue: string;
    category: string;
    expiryDate: Date;
    isRecommended: boolean;
    recommendationReason?: string;
  }>;
  compatibleBusinesses: Array<{
    businessId: string;
    businessName: string;
    category: string;
    matchReason: string;
    hasActiveOffers: boolean;
    loyaltyBenefits: string[];
  }>;
}

function RecommendationCard({ recommendation }: { recommendation: PersonalizedData['recommendations'][0] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'offer': return <Gift className="h-5 w-5" />;
      case 'business': return <Store className="h-5 w-5" />;
      case 'mukando': return <Users className="h-5 w-5" />;
      case 'tier': return <Star className="h-5 w-5" />;
      case 'financial': return <TrendingUp className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className={`border ${getPriorityColor(recommendation.priority)} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg ${
            recommendation.priority === 'high' ? 'bg-red-100 text-red-600' :
            recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
            'bg-green-100 text-green-600'
          }`}>
            {getIcon(recommendation.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{recommendation.title}</h4>
              <Badge variant="outline" className="text-xs capitalize">
                {recommendation.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {recommendation.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="text-xs text-green-600 font-medium">
                {recommendation.expectedBenefit}
              </div>
              <Button size="sm" variant="outline" className="text-xs h-7">
                {recommendation.actionText}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementCard({ achievement }: { achievement: PersonalizedData['achievementOpportunities'][0] }) {
  const progressPercentage = (achievement.currentProgress / achievement.target) * 100;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'tier_upgrade': return <Star className="h-5 w-5" />;
      case 'milestone': return <Target className="h-5 w-5" />;
      case 'challenge': return <Zap className="h-5 w-5" />;
      case 'streak': return <CheckCircle className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  return (
    <Card className="border border-blue-200 bg-blue-50 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100 text-blue-600">
            {getIcon(achievement.type)}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{achievement.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {achievement.description}
            </p>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-medium">
                  {achievement.currentProgress} / {achievement.target}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="text-green-600 font-medium">
                🏆 {achievement.reward}
              </div>
              <div className="text-muted-foreground">
                <Clock className="h-3 w-3 inline mr-1" />
                {achievement.timeframe}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialTipCard({ tip }: { tip: PersonalizedData['financialTips'][0] }) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'saving': return <DollarSign className="h-4 w-4" />;
      case 'earning': return <TrendingUp className="h-4 w-4" />;
      case 'spending': return <Heart className="h-4 w-4" />;
      case 'planning': return <Target className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border border-purple-200 bg-purple-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 rounded-lg bg-purple-100 text-purple-600">
            {getCategoryIcon(tip.category)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs capitalize">
                {tip.category}
              </Badge>
              <Badge className={`text-xs ${getDifficultyColor(tip.difficulty)}`}>
                {tip.difficulty}
              </Badge>
            </div>
            <p className="text-sm mb-2">{tip.tip}</p>
            <div className="text-xs text-purple-600 font-medium">
              💡 {tip.impact}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OfferCard({ offer }: { offer: OffersData['activeOffers'][0] }) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${offer.isRecommended ? 'border-green-300 bg-green-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{offer.offerName}</h4>
            <p className="text-xs text-muted-foreground">{offer.businessName}</p>
          </div>
          {offer.isRecommended && (
            <Badge variant="default" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
          )}
        </div>
        
        {offer.description && (
          <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>
        )}
        
        {offer.isRecommended && offer.recommendationReason && (
          <div className="mb-3 p-2 bg-green-100 rounded-lg">
            <p className="text-xs text-green-700">💡 {offer.recommendationReason}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">{offer.pointsRequired}</span>
            <span className="text-muted-foreground"> points</span>
          </div>
          <Button size="sm" variant="outline" className="text-xs h-7">
            Redeem Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BusinessCard({ business }: { business: OffersData['compatibleBusinesses'][0] }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100 text-blue-600">
            <Store className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{business.businessName}</h4>
              <Badge variant="outline" className="text-xs">
                {business.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{business.matchReason}</p>
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-1">Benefits:</div>
              <ul className="text-xs space-y-1">
                {business.loyaltyBenefits.slice(0, 2).map((benefit, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between">
              {business.hasActiveOffers && (
                <Badge variant="default" className="text-xs">
                  <Gift className="h-3 w-3 mr-1" />
                  Active Offers
                </Badge>
              )}
              <Button size="sm" variant="outline" className="text-xs h-7 ml-auto">
                <Link href={`/customer/businesses/${business.businessId}`}>
                  Visit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PersonalizedRecommendations() {
  const [personalizedData, setPersonalizedData] = useState<PersonalizedData | null>(null);
  const [offersData, setOffersData] = useState<OffersData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const [insightsResponse, offersResponse] = await Promise.all([
          customerAdvisorApi.getPersonalizedData('insights'),
          customerAdvisorApi.getPersonalizedData('offers')
        ]);

        if (insightsResponse.success) {
          setPersonalizedData(insightsResponse.data);
        }

        if (offersResponse.success) {
          setOffersData(offersResponse.data);
        }

      } catch (err: any) {
        console.error('Error fetching personalized data:', err);
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Personalized For You
          </CardTitle>
          <CardDescription>AI-powered recommendations based on your preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Personalized For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load personalized recommendations. Please check back later!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const hasOffers = offersData?.activeOffers && offersData.activeOffers.length > 0;
  const hasBusinesses = offersData?.compatibleBusinesses && offersData.compatibleBusinesses.length > 0;
  const hasRecommendations = personalizedData?.recommendations && personalizedData.recommendations.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Personalized For You
        </CardTitle>
        <CardDescription>AI-powered recommendations based on your preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="achievements">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            {hasRecommendations ? (
              <>
                {personalizedData!.recommendations.map((rec, index) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))}
                {personalizedData!.financialTips.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Financial Tips for You
                    </h4>
                    {personalizedData!.financialTips.slice(0, 2).map((tip, index) => (
                      <FinancialTipCard key={index} tip={tip} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No personalized recommendations available right now. Keep using the platform to get better suggestions!
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="offers" className="space-y-4">
            {hasOffers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offersData!.activeOffers.map((offer) => (
                  <OfferCard key={offer.offerId} offer={offer} />
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No offers available at the moment. Check back later for new deals!
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="businesses" className="space-y-4">
            {hasBusinesses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offersData!.compatibleBusinesses.map((business) => (
                  <BusinessCard key={business.businessId} business={business} />
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No businesses registered yet. Check back later to discover new places!
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {personalizedData?.achievementOpportunities && personalizedData.achievementOpportunities.length > 0 ? (
              personalizedData.achievementOpportunities.map((achievement, index) => (
                <AchievementCard key={index} achievement={achievement} />
              ))
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No achievement goals available. Keep earning points to unlock new milestones!
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
