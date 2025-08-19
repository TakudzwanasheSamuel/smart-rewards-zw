import { prisma } from '@/lib/db/prisma';
import { startOfDay, endOfDay, subDays, subMonths, format } from 'date-fns';

export interface CustomerProfile {
  customerId: string;
  fullName: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  ecoPoints: number;
  interests: string[];
  hasPremiumSubscription: boolean;
  joinedDate: Date;
  lastActiveDate: Date;
}

export interface CustomerSpendingPattern {
  totalTransactions: number;
  totalSpent: number;
  averageTransactionValue: number;
  frequentBusinessCategories: Array<{
    category: string;
    transactionCount: number;
    totalSpent: number;
  }>;
  preferredBusinesses: Array<{
    businessId: string;
    businessName: string;
    transactionCount: number;
    totalPoints: number;
  }>;
  spendingTrend: Array<{
    date: string;
    transactions: number;
    amount: number;
    points: number;
  }>;
}

export interface CustomerEngagement {
  engagementScore: number;
  daysSinceLastTransaction: number;
  averageTransactionsPerWeek: number;
  loyaltyProgamParticipation: number;
  mukandoParticipation: {
    isActive: boolean;
    groupsJoined: number;
    totalContributions: number;
    groupsCompleted: number;
  };
  offerRedemptionRate: number;
  referralActivity: {
    referralsMade: number;
    bonusesEarned: number;
  };
}

export interface PersonalizedInsights {
  profile: CustomerProfile;
  spendingPattern: CustomerSpendingPattern;
  engagement: CustomerEngagement;
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

export interface AvailableOffers {
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
    distance?: number;
    matchReason: string;
    hasActiveOffers: boolean;
    loyaltyBenefits: string[];
  }>;
}

export class CustomerAnalytics {
  constructor(private customerId: string) {}

  async getCustomerProfile(): Promise<CustomerProfile> {
    const customer = await prisma.customer.findUnique({
      where: { user_id: this.customerId },
      include: {
        user: true,
        transactions: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return {
      customerId: customer.user_id,
      fullName: customer.full_name || 'Customer',
      loyaltyPoints: customer.loyalty_points,
      loyaltyTier: customer.loyalty_tier,
      ecoPoints: customer.eco_points,
      interests: customer.interests,
      hasPremiumSubscription: customer.has_premium_subscription,
      joinedDate: customer.user.created_at,
      lastActiveDate: customer.transactions[0]?.created_at || customer.user.created_at
    };
  }

  async analyzeSpendingPattern(): Promise<CustomerSpendingPattern> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    const transactions = await prisma.transaction.findMany({
      where: { 
        customer_id: this.customerId,
        created_at: { gte: thirtyDaysAgo }
      },
      include: {
        business: true
      },
      orderBy: { created_at: 'desc' }
    });

    const totalTransactions = transactions.length;
    const totalSpent = transactions.reduce((sum, t) => sum + (Number(t.transaction_amount) || 0), 0);
    const averageTransactionValue = totalTransactions > 0 ? totalSpent / totalTransactions : 0;

    // Analyze business categories
    const categoryMap = new Map<string, { count: number; spent: number }>();
    const businessMap = new Map<string, { name: string; count: number; points: number }>();

    transactions.forEach(transaction => {
      const category = transaction.business?.business_category || 'Other';
      const existing = categoryMap.get(category) || { count: 0, spent: 0 };
      categoryMap.set(category, {
        count: existing.count + 1,
        spent: existing.spent + (Number(transaction.transaction_amount) || 0)
      });

      if (transaction.business) {
        const businessKey = transaction.business.user_id;
        const existingBusiness = businessMap.get(businessKey) || { 
          name: transaction.business.business_name, 
          count: 0, 
          points: 0 
        };
        businessMap.set(businessKey, {
          name: existingBusiness.name,
          count: existingBusiness.count + 1,
          points: existingBusiness.points + (transaction.points_earned || 0)
        });
      }
    });

    const frequentBusinessCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        transactionCount: data.count,
        totalSpent: data.spent
      }))
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 5);

    const preferredBusinesses = Array.from(businessMap.entries())
      .map(([businessId, data]) => ({
        businessId,
        businessName: data.name,
        transactionCount: data.count,
        totalPoints: data.points
      }))
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 5);

    // Generate spending trend for last 30 days
    const spendingTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayTransactions = transactions.filter(
        t => t.created_at >= dayStart && t.created_at <= dayEnd
      );
      
      spendingTrend.push({
        date: format(date, 'yyyy-MM-dd'),
        transactions: dayTransactions.length,
        amount: dayTransactions.reduce((sum, t) => sum + (Number(t.transaction_amount) || 0), 0),
        points: dayTransactions.reduce((sum, t) => sum + (t.points_earned || 0), 0)
      });
    }

    return {
      totalTransactions,
      totalSpent,
      averageTransactionValue,
      frequentBusinessCategories,
      preferredBusinesses,
      spendingTrend
    };
  }

  async analyzeEngagement(): Promise<CustomerEngagement> {
    const customer = await prisma.customer.findUnique({
      where: { user_id: this.customerId },
      include: {
        transactions: {
          orderBy: { created_at: 'desc' }
        },
        mukando_memberships: {
          include: {
            group: true
          }
        },
        mukando_contributions: true,
        redeemed_offers: true
      }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    const recentTransactions = customer.transactions.filter(t => t.created_at >= thirtyDaysAgo);
    const lastTransaction = customer.transactions[0];
    
    const daysSinceLastTransaction = lastTransaction 
      ? Math.floor((now.getTime() - lastTransaction.created_at.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const averageTransactionsPerWeek = recentTransactions.length / 4; // 30 days ≈ 4 weeks

    // Calculate engagement score (0-100)
    let engagementScore = 50; // Base score
    
    // Recent activity bonus
    if (daysSinceLastTransaction <= 7) engagementScore += 20;
    else if (daysSinceLastTransaction <= 30) engagementScore += 10;
    else engagementScore -= 20;

    // Transaction frequency bonus
    if (averageTransactionsPerWeek >= 3) engagementScore += 15;
    else if (averageTransactionsPerWeek >= 1) engagementScore += 8;

    // Mukando participation bonus
    const activeMukandoGroups = customer.mukando_memberships.filter(
      m => m.group.status === 'approved'
    ).length;
    if (activeMukandoGroups > 0) engagementScore += 10;

    // Offer redemption bonus
    const recentRedemptions = customer.redeemed_offers.filter(
      r => r.redemption_timestamp >= thirtyDaysAgo
    ).length;
    if (recentRedemptions > 0) engagementScore += 5;

    engagementScore = Math.max(0, Math.min(100, engagementScore));

    return {
      engagementScore,
      daysSinceLastTransaction,
      averageTransactionsPerWeek,
      loyaltyProgamParticipation: (customer.loyalty_points / 1000) * 100, // Normalize to percentage
      mukandoParticipation: {
        isActive: activeMukandoGroups > 0,
        groupsJoined: customer.mukando_memberships.length,
        totalContributions: customer.mukando_contributions.length,
        groupsCompleted: customer.mukando_memberships.filter(
          m => m.group.status === 'completed'
        ).length
      },
      offerRedemptionRate: customer.redeemed_offers.length,
      referralActivity: {
        referralsMade: 0, // Would need referral tracking
        bonusesEarned: 0
      }
    };
  }

  async getAvailableOffers(): Promise<AvailableOffers> {
    const customer = await prisma.customer.findUnique({
      where: { user_id: this.customerId },
      include: {
        transactions: {
          include: { business: true }
        },
        redeemed_offers: true
      }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get all active offers
    const activeOffers = await prisma.offer.findMany({
      where: {
        active_from: { lte: new Date() },
        OR: [
          { active_to: null },
          { active_to: { gte: new Date() } }
        ]
      },
      include: {
        business: true,
        redeemed_offers: true
      }
    });

    // Get businesses customer has interacted with
    const customerBusinesses = new Set(
      customer.transactions.map(t => t.business_id).filter(Boolean)
    );

    // Get customer's preferred categories
    const categoryPreferences = new Map<string, number>();
    customer.transactions.forEach(t => {
      if (t.business?.business_category) {
        const category = t.business.business_category;
        categoryPreferences.set(category, (categoryPreferences.get(category) || 0) + 1);
      }
    });

    const sortedCategories = Array.from(categoryPreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);

    // Process offers with recommendations
    const processedOffers = activeOffers
      .filter(offer => offer.points_required && offer.points_required <= customer.loyalty_points)
      .map(offer => {
        let isRecommended = false;
        let recommendationReason = '';

        // Check if from preferred business
        if (customerBusinesses.has(offer.business_id)) {
          isRecommended = true;
          recommendationReason = 'From a business you frequent';
        }
        // Check if from preferred category
        else if (offer.business.business_category && sortedCategories.includes(offer.business.business_category)) {
          isRecommended = true;
          recommendationReason = `Matches your ${offer.business.business_category} preferences`;
        }
        // Check if affordable and valuable
        else if (offer.points_required <= customer.loyalty_points * 0.3) {
          isRecommended = true;
          recommendationReason = 'Great value for your points';
        }

        return {
          offerId: offer.id,
          businessId: offer.business_id,
          businessName: offer.business.business_name,
          offerName: offer.offer_name,
          description: offer.description || '',
          pointsRequired: offer.points_required,
          discountValue: offer.reward_type === 'monetary' ? 'Discount' : 'Reward',
          category: offer.business.business_category || 'Other',
          expiryDate: offer.active_to || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isRecommended,
          recommendationReason
        };
      })
      .sort((a, b) => {
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        return a.pointsRequired - b.pointsRequired;
      });

    // Get compatible businesses (all businesses)
    const allBusinesses = await prisma.business.findMany({
      include: {
        offers: {
          where: {
            active_from: { lte: new Date() },
            OR: [
              { active_to: null },
              { active_to: { gte: new Date() } }
            ]
          }
        }
      }
    });

    const compatibleBusinesses = allBusinesses.map(business => {
      let matchReason = 'New business to explore';
      
      if (customerBusinesses.has(business.user_id)) {
        matchReason = 'One of your favorite businesses';
      } else if (business.business_category && sortedCategories.includes(business.business_category)) {
        matchReason = `Matches your ${business.business_category} interests`;
      }

      return {
        businessId: business.user_id,
        businessName: business.business_name,
        category: business.business_category || 'Other',
        matchReason,
        hasActiveOffers: business.offers.length > 0,
        loyaltyBenefits: [
          'Earn loyalty points',
          'Access to exclusive offers',
          business.offers.length > 0 ? 'Active promotions available' : 'Future offers coming soon'
        ]
      };
    });

    return {
      activeOffers: processedOffers,
      compatibleBusinesses
    };
  }

  async generatePersonalizedInsights(): Promise<PersonalizedInsights> {
    const [profile, spendingPattern, engagement, offers] = await Promise.all([
      this.getCustomerProfile(),
      this.analyzeSpendingPattern(),
      this.analyzeEngagement(),
      this.getAvailableOffers()
    ]);

    const recommendations = [];
    const achievementOpportunities = [];
    const financialTips = [];

    // Generate recommendations based on data
    if (offers.activeOffers.length > 0) {
      const topOffer = offers.activeOffers.find(o => o.isRecommended) || offers.activeOffers[0];
      recommendations.push({
        type: 'offer' as const,
        priority: 'high' as const,
        title: `Redeem: ${topOffer.offerName}`,
        description: `You can redeem this offer from ${topOffer.businessName}`,
        actionText: 'Redeem Now',
        expectedBenefit: `Save with your ${topOffer.pointsRequired} points`,
        category: 'offers',
        data: topOffer
      });
    }

    // Business recommendations
    const unvisitedBusinesses = offers.compatibleBusinesses.filter(
      b => !spendingPattern.preferredBusinesses.some(pb => pb.businessId === b.businessId)
    );
    
    if (unvisitedBusinesses.length > 0) {
      const topBusiness = unvisitedBusinesses[0];
      recommendations.push({
        type: 'business' as const,
        priority: 'medium' as const,
        title: `Try ${topBusiness.businessName}`,
        description: topBusiness.matchReason,
        actionText: 'Visit Business',
        expectedBenefit: 'Earn points and discover new offers',
        category: 'discovery',
        data: topBusiness
      });
    }

    // Mukando recommendations
    if (!engagement.mukandoParticipation.isActive) {
      recommendations.push({
        type: 'mukando' as const,
        priority: 'medium' as const,
        title: 'Join a Mukando Savings Group',
        description: 'Save together with other customers towards shared goals',
        actionText: 'Explore Groups',
        expectedBenefit: 'Earn bonus points while saving for rewards',
        category: 'community'
      });
    }

    // Tier upgrade opportunities
    const tierThresholds = {
      'Bronze': 500,
      'Silver': 1500,
      'Gold': 5000,
      'Platinum': 10000
    };

    const nextTier = profile.loyaltyTier === 'Bronze' ? 'Silver' :
                    profile.loyaltyTier === 'Silver' ? 'Gold' :
                    profile.loyaltyTier === 'Gold' ? 'Platinum' : null;

    if (nextTier && tierThresholds[nextTier as keyof typeof tierThresholds]) {
      const pointsNeeded = tierThresholds[nextTier as keyof typeof tierThresholds] - profile.loyaltyPoints;
      if (pointsNeeded > 0) {
        achievementOpportunities.push({
          type: 'tier_upgrade',
          title: `Reach ${nextTier} Tier`,
          description: `Unlock exclusive benefits and better rewards`,
          currentProgress: profile.loyaltyPoints,
          target: tierThresholds[nextTier as keyof typeof tierThresholds],
          reward: `${nextTier} tier benefits and bonuses`,
          timeframe: 'Next 2-3 months'
        });
      }
    }

    // Financial tips based on spending pattern
    if (spendingPattern.averageTransactionValue > 0) {
      financialTips.push({
        category: 'earning',
        tip: `Your average transaction is $${spendingPattern.averageTransactionValue.toFixed(2)}. Look for businesses offering bonus point multipliers!`,
        impact: 'Earn 20-50% more points per transaction',
        difficulty: 'easy'
      });
    }

    if (profile.loyaltyPoints >= 1000) {
      financialTips.push({
        category: 'spending',
        tip: 'You have accumulated significant points. Consider redeeming some for immediate benefits!',
        impact: 'Convert points to valuable rewards',
        difficulty: 'easy'
      });
    }

    return {
      profile,
      spendingPattern,
      engagement,
      recommendations,
      achievementOpportunities,
      financialTips
    };
  }
}
