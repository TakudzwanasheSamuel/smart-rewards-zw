import { prisma } from '@/lib/db/prisma';
import { startOfDay, endOfDay, subDays, subMonths, format } from 'date-fns';

export interface BusinessMetrics {
  // Customer Metrics
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomersThisMonth: number;
  customerGrowthRate: number;
  averageCustomerLifetime: number;
  topCustomersByPoints: Array<{
    customerId: string;
    fullName: string;
    totalPoints: number;
    tier: string;
  }>;

  // Transaction Metrics
  totalTransactions: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  averageTransactionValue: number;
  transactionTrend: Array<{
    date: string;
    transactions: number;
    points: number;
  }>;

  // Engagement Metrics
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionsPerUser: number;
  churnRate: number;
  retentionRate: number;

  // Loyalty Program Performance
  tierDistribution: Record<string, number>;
  redemptionRate: number;
  mostPopularOffers: Array<{
    offerId: string;
    offerName: string;
    redemptions: number;
    pointsRequired: number;
  }>;

  // Mukando Performance
  activeMukandoGroups: number;
  totalMukandoContributions: number;
  mukandoEngagementRate: number;
  averageGroupSize: number;

  // Business-Specific Insights
  peakTransactionHours: Array<{
    hour: number;
    transactionCount: number;
  }>;
  categoryPerformance: Record<string, {
    customers: number;
    transactions: number;
    totalPoints: number;
  }>;

  // Financial Insights
  totalRevenueValue: number;
  averageRevenuePerUser: number;
  costPerAcquisition: number;
  lifetimeValue: number;
}

export interface CustomerSegment {
  segmentName: string;
  customerCount: number;
  characteristics: string[];
  recommendations: string[];
  averagePoints: number;
  engagementLevel: 'high' | 'medium' | 'low';
}

export interface BusinessInsights {
  metrics: BusinessMetrics;
  segments: CustomerSegment[];
  opportunities: Array<{
    type: 'growth' | 'retention' | 'engagement' | 'revenue';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedImpact: string;
    recommendedActions: string[];
  }>;
  alerts: Array<{
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    actionRequired: boolean;
  }>;
}

export class BusinessMetricsCalculator {
  constructor(private businessId: string) {}

  async calculateMetrics(): Promise<BusinessMetrics> {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const ninetyDaysAgo = subDays(now, 90);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get business relationships and transactions
    const businessRelations = await prisma.customerBusinessRelation.findMany({
      where: { business_id: this.businessId },
      include: {
        customer: {
          include: {
            user: true,
            transactions: {
              where: { business_id: this.businessId }
            }
          }
        }
      }
    });

    const allTransactions = await prisma.transaction.findMany({
      where: { business_id: this.businessId },
      include: { customer: true },
      orderBy: { created_at: 'desc' }
    });

    const offers = await prisma.offer.findMany({
      where: { business_id: this.businessId },
      include: { redeemed_offers: true }
    });

    const mukandoGroups = await prisma.mukandoGroup.findMany({
      where: { business_id: this.businessId },
      include: {
        members: true,
        contributions: true
      }
    });

    // Calculate customer metrics
    const totalCustomers = businessRelations.length;
    
    const newCustomersThisMonth = businessRelations.filter(
      rel => rel.customer.user.created_at >= startOfMonth
    ).length;

    const activeCustomersThisMonth = businessRelations.filter(
      rel => rel.customer.transactions.some(
        t => t.created_at >= startOfMonth
      )
    ).length;

    const customerGrowthRate = totalCustomers > 0 
      ? (newCustomersThisMonth / totalCustomers) * 100 
      : 0;

    // Calculate transaction metrics
    const totalTransactions = allTransactions.length;
    const totalPointsEarned = allTransactions.reduce(
      (sum, t) => sum + (t.points_earned || 0), 0
    );
    const totalPointsRedeemed = allTransactions.reduce(
      (sum, t) => sum + (t.points_deducted || 0), 0
    );
    
    const totalTransactionValue = allTransactions.reduce(
      (sum, t) => sum + (Number(t.transaction_amount) || 0), 0
    );
    const averageTransactionValue = totalTransactions > 0 
      ? totalTransactionValue / totalTransactions 
      : 0;

    // Calculate engagement metrics
    const recentTransactions = allTransactions.filter(
      t => t.created_at >= thirtyDaysAgo
    );
    
    const dailyActiveUsers = new Set(
      allTransactions
        .filter(t => t.created_at >= subDays(now, 1))
        .map(t => t.customer_id)
    ).size;

    const weeklyActiveUsers = new Set(
      allTransactions
        .filter(t => t.created_at >= subDays(now, 7))
        .map(t => t.customer_id)
    ).size;

    const monthlyActiveUsers = new Set(
      recentTransactions.map(t => t.customer_id)
    ).size;

    // Calculate tier distribution
    const tierDistribution: Record<string, number> = {};
    businessRelations.forEach(rel => {
      const tier = rel.customer.loyalty_tier;
      tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
    });

    // Calculate redemption rate
    const totalRedemptions = offers.reduce(
      (sum, offer) => sum + offer.redeemed_offers.length, 0
    );
    const redemptionRate = totalCustomers > 0 
      ? (totalRedemptions / totalCustomers) * 100 
      : 0;

    // Get most popular offers
    const mostPopularOffers = offers
      .map(offer => ({
        offerId: offer.id,
        offerName: offer.offer_name,
        redemptions: offer.redeemed_offers.length,
        pointsRequired: offer.points_required || 0
      }))
      .sort((a, b) => b.redemptions - a.redemptions)
      .slice(0, 5);

    // Calculate Mukando metrics
    const activeMukandoGroups = mukandoGroups.filter(
      group => group.status === 'approved'
    ).length;

    const totalMukandoContributions = mukandoGroups.reduce(
      (sum, group) => sum + group.contributions.length, 0
    );

    const mukandoParticipants = new Set(
      mukandoGroups.flatMap(group => group.members.map(m => m.customer_id))
    ).size;

    const mukandoEngagementRate = totalCustomers > 0 
      ? (mukandoParticipants / totalCustomers) * 100 
      : 0;

    const averageGroupSize = mukandoGroups.length > 0
      ? mukandoGroups.reduce((sum, group) => sum + group.members.length, 0) / mukandoGroups.length
      : 0;

    // Calculate transaction trends
    const transactionTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayTransactions = allTransactions.filter(
        t => t.created_at >= dayStart && t.created_at <= dayEnd
      );
      
      transactionTrend.push({
        date: format(date, 'yyyy-MM-dd'),
        transactions: dayTransactions.length,
        points: dayTransactions.reduce((sum, t) => sum + (t.points_earned || 0), 0)
      });
    }

    // Get top customers by points
    const topCustomersByPoints = businessRelations
      .map(rel => ({
        customerId: rel.customer_id,
        fullName: rel.customer.full_name || 'Unknown',
        totalPoints: rel.customer.loyalty_points,
        tier: rel.customer.loyalty_tier
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);

    // Calculate peak transaction hours
    const hourlyTransactions: Record<number, number> = {};
    allTransactions.forEach(t => {
      const hour = t.created_at.getHours();
      hourlyTransactions[hour] = (hourlyTransactions[hour] || 0) + 1;
    });

    const peakTransactionHours = Object.entries(hourlyTransactions)
      .map(([hour, count]) => ({ hour: parseInt(hour), transactionCount: count }))
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 5);

    // Calculate retention and churn rates
    const oldCustomers = businessRelations.filter(
      rel => rel.customer.user.created_at <= ninetyDaysAgo
    );
    
    const retainedCustomers = oldCustomers.filter(
      rel => rel.customer.transactions.some(
        t => t.created_at >= thirtyDaysAgo
      )
    );

    const retentionRate = oldCustomers.length > 0
      ? (retainedCustomers.length / oldCustomers.length) * 100
      : 0;
    
    const churnRate = 100 - retentionRate;

    return {
      totalCustomers,
      newCustomersThisMonth,
      activeCustomersThisMonth,
      customerGrowthRate,
      averageCustomerLifetime: 0, // Would need more complex calculation
      topCustomersByPoints,
      totalTransactions,
      totalPointsEarned,
      totalPointsRedeemed,
      averageTransactionValue,
      transactionTrend,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      averageSessionsPerUser: 0, // Would need session tracking
      churnRate,
      retentionRate,
      tierDistribution,
      redemptionRate,
      mostPopularOffers,
      activeMukandoGroups,
      totalMukandoContributions,
      mukandoEngagementRate,
      averageGroupSize,
      peakTransactionHours,
      categoryPerformance: {}, // Would need category mapping
      totalRevenueValue: totalTransactionValue,
      averageRevenuePerUser: totalCustomers > 0 ? totalTransactionValue / totalCustomers : 0,
      costPerAcquisition: 0, // Would need marketing spend data
      lifetimeValue: 0 // Would need more complex calculation
    };
  }

  async generateCustomerSegments(): Promise<CustomerSegment[]> {
    const businessRelations = await prisma.customerBusinessRelation.findMany({
      where: { business_id: this.businessId },
      include: {
        customer: {
          include: {
            user: true,
            transactions: {
              where: { business_id: this.businessId }
            }
          }
        }
      }
    });

    const segments: CustomerSegment[] = [];

    // High-Value Customers
    const highValueCustomers = businessRelations.filter(
      rel => rel.customer.loyalty_points >= 1000
    );
    
    if (highValueCustomers.length > 0) {
      segments.push({
        segmentName: 'High-Value Customers',
        customerCount: highValueCustomers.length,
        characteristics: [
          'High loyalty points (1000+)',
          'Frequent transactions',
          'High engagement with rewards'
        ],
        recommendations: [
          'Create exclusive VIP offers',
          'Provide early access to new products',
          'Implement tier-based benefits'
        ],
        averagePoints: highValueCustomers.reduce((sum, rel) => sum + rel.customer.loyalty_points, 0) / highValueCustomers.length,
        engagementLevel: 'high'
      });
    }

    // New Customers
    const newCustomers = businessRelations.filter(
      rel => rel.customer.user.created_at >= subDays(new Date(), 30)
    );
    
    if (newCustomers.length > 0) {
      segments.push({
        segmentName: 'New Customers',
        customerCount: newCustomers.length,
        characteristics: [
          'Recently joined (last 30 days)',
          'Still learning the platform',
          'High potential for growth'
        ],
        recommendations: [
          'Implement onboarding program',
          'Provide welcome bonuses',
          'Send educational content'
        ],
        averagePoints: newCustomers.reduce((sum, rel) => sum + rel.customer.loyalty_points, 0) / newCustomers.length,
        engagementLevel: 'medium'
      });
    }

    // At-Risk Customers
    const atRiskCustomers = businessRelations.filter(rel => {
      const lastTransaction = rel.customer.transactions
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];
      return !lastTransaction || lastTransaction.created_at <= subDays(new Date(), 60);
    });
    
    if (atRiskCustomers.length > 0) {
      segments.push({
        segmentName: 'At-Risk Customers',
        customerCount: atRiskCustomers.length,
        characteristics: [
          'No recent activity (60+ days)',
          'Declining engagement',
          'Risk of churn'
        ],
        recommendations: [
          'Send re-engagement campaigns',
          'Offer special comeback deals',
          'Gather feedback on experience'
        ],
        averagePoints: atRiskCustomers.reduce((sum, rel) => sum + rel.customer.loyalty_points, 0) / atRiskCustomers.length,
        engagementLevel: 'low'
      });
    }

    return segments;
  }
}
