import { prisma } from '@/lib/db/prisma';

export interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
  category: 'activity' | 'social' | 'milestone' | 'special';
  criteria: BadgeCriteria;
  pointsReward: number;
}

export interface BadgeCriteria {
  type: 'count' | 'threshold' | 'streak' | 'achievement' | 'combination';
  conditions: {
    field?: string;
    operator?: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
    value?: number;
    tables?: string[];
    customQuery?: string;
    subCriteria?: BadgeCriteria[];
  };
}

export interface CustomerStats {
  customerId: string;
  totalTransactions: number;
  totalPointsEarned: number;
  currentLoyaltyPoints: number;
  businessesFollowed: number;
  mukandoGroupsJoined: number;
  mukandoGroupsCreated: number;
  offersRedeemed: number;
  loyaltyTier: string;
  accountAge: number; // days since registration
  mukandoContributions: number;
  totalMukandoPointsContributed: number;
  streakDays?: number;
  firstTransactionDate?: Date;
  lastTransactionDate?: Date;
}

// Predefined badge definitions
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Activity Badges
  {
    name: "Welcome Aboard",
    description: "Successfully registered and joined Smart Rewards",
    icon: "Sparkles",
    category: "activity",
    criteria: {
      type: "achievement",
      conditions: { field: "account_created" }
    },
    pointsReward: 50
  },
  {
    name: "First Steps",
    description: "Made your first transaction or earned your first points",
    icon: "Footprints",
    category: "activity",
    criteria: {
      type: "threshold",
      conditions: { field: "totalTransactions", operator: "gte", value: 1 }
    },
    pointsReward: 100
  },
  {
    name: "Scanner Pro",
    description: "Successfully scanned 10 receipts or completed 10 transactions",
    icon: "QrCode",
    category: "activity",
    criteria: {
      type: "threshold",
      conditions: { field: "totalTransactions", operator: "gte", value: 10 }
    },
    pointsReward: 200
  },
  {
    name: "Transaction Master",
    description: "Completed 50 transactions",
    icon: "Activity",
    category: "activity",
    criteria: {
      type: "threshold",
      conditions: { field: "totalTransactions", operator: "gte", value: 50 }
    },
    pointsReward: 500
  },

  // Social Badges
  {
    name: "Business Explorer",
    description: "Followed 5 businesses",
    icon: "Compass",
    category: "social",
    criteria: {
      type: "threshold",
      conditions: { field: "businessesFollowed", operator: "gte", value: 5 }
    },
    pointsReward: 150
  },
  {
    name: "Community Member",
    description: "Followed 15 businesses",
    icon: "Users",
    category: "social",
    criteria: {
      type: "threshold",
      conditions: { field: "businessesFollowed", operator: "gte", value: 15 }
    },
    pointsReward: 300
  },
  {
    name: "Network Builder",
    description: "Followed 30 businesses",
    icon: "Network",
    category: "social",
    criteria: {
      type: "threshold",
      conditions: { field: "businessesFollowed", operator: "gte", value: 30 }
    },
    pointsReward: 500
  },

  // Mukando Badges
  {
    name: "Mukando Starter",
    description: "Joined your first Mukando savings group",
    icon: "Trophy",
    category: "social",
    criteria: {
      type: "threshold",
      conditions: { field: "mukandoGroupsJoined", operator: "gte", value: 1 }
    },
    pointsReward: 200
  },
  {
    name: "Group Creator",
    description: "Created your first Mukando group",
    icon: "Star",
    category: "social",
    criteria: {
      type: "threshold",
      conditions: { field: "mukandoGroupsCreated", operator: "gte", value: 1 }
    },
    pointsReward: 300
  },
  {
    name: "Savings Champion",
    description: "Made 10 Mukando contributions",
    icon: "PiggyBank",
    category: "milestone",
    criteria: {
      type: "threshold",
      conditions: { field: "mukandoContributions", operator: "gte", value: 10 }
    },
    pointsReward: 400
  },
  {
    name: "Community Builder",
    description: "Participated in 3 Mukando groups",
    icon: "Users2",
    category: "social",
    criteria: {
      type: "threshold",
      conditions: { field: "mukandoGroupsJoined", operator: "gte", value: 3 }
    },
    pointsReward: 500
  },

  // Milestone Badges
  {
    name: "Points Collector",
    description: "Earned 1,000 loyalty points",
    icon: "Coins",
    category: "milestone",
    criteria: {
      type: "threshold",
      conditions: { field: "totalPointsEarned", operator: "gte", value: 1000 }
    },
    pointsReward: 200
  },
  {
    name: "Silver Achiever",
    description: "Reached Silver tier",
    icon: "Medal",
    category: "milestone",
    criteria: {
      type: "achievement",
      conditions: { field: "loyaltyTier", value: "Silver" }
    },
    pointsReward: 500
  },
  {
    name: "Gold Master",
    description: "Reached Gold tier",
    icon: "Crown",
    category: "milestone",
    criteria: {
      type: "achievement",
      conditions: { field: "loyaltyTier", value: "Gold" }
    },
    pointsReward: 1000
  },
  {
    name: "High Roller",
    description: "Earned 10,000 loyalty points",
    icon: "Diamond",
    category: "milestone",
    criteria: {
      type: "threshold",
      conditions: { field: "totalPointsEarned", operator: "gte", value: 10000 }
    },
    pointsReward: 1000
  },

  // Special Badges
  {
    name: "Smart Spender",
    description: "Redeemed 5 offers",
    icon: "ShoppingBag",
    category: "special",
    criteria: {
      type: "threshold",
      conditions: { field: "offersRedeemed", operator: "gte", value: 5 }
    },
    pointsReward: 250
  },
  {
    name: "Loyal Customer",
    description: "Active for 30 days",
    icon: "Heart",
    category: "special",
    criteria: {
      type: "threshold",
      conditions: { field: "accountAge", operator: "gte", value: 30 }
    },
    pointsReward: 300
  },
  {
    name: "Veteran Member",
    description: "Active for 90 days",
    icon: "Shield",
    category: "special",
    criteria: {
      type: "threshold",
      conditions: { field: "accountAge", operator: "gte", value: 90 }
    },
    pointsReward: 500
  },
  {
    name: "Eco-Warrior",
    description: "Contributed over 5,000 points to Mukando groups",
    icon: "Award",
    category: "special",
    criteria: {
      type: "threshold",
      conditions: { field: "totalMukandoPointsContributed", operator: "gte", value: 5000 }
    },
    pointsReward: 750
  }
];

export class BadgeEngine {
  /**
   * Get comprehensive statistics for a customer
   */
  async getCustomerStats(customerId: string): Promise<CustomerStats> {
    // Get basic customer data
    const customer = await prisma.customer.findUnique({
      where: { user_id: customerId },
      include: {
        user: true,
        transactions: true,
        customer_business_relations: true,
        mukando_memberships: true,
        created_mukando_groups: true,
        mukando_contributions: true,
        redeemed_offers: true,
      }
    });

    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }

    // Calculate account age
    const accountAge = Math.floor(
      (Date.now() - customer.user.created_at.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate total points earned from transactions
    const totalPointsEarned = customer.transactions.reduce(
      (sum, tx) => sum + (tx.points_earned || 0), 0
    );

    // Get transaction dates for streak calculation
    const transactionDates = customer.transactions
      .map(tx => tx.created_at)
      .sort((a, b) => a.getTime() - b.getTime());

    const firstTransactionDate = transactionDates[0];
    const lastTransactionDate = transactionDates[transactionDates.length - 1];

    // Calculate total Mukando points contributed
    const totalMukandoPointsContributed = customer.mukando_contributions.reduce(
      (sum, contrib) => sum + contrib.points_amount, 0
    );

    return {
      customerId,
      totalTransactions: customer.transactions.length,
      totalPointsEarned,
      currentLoyaltyPoints: customer.loyalty_points,
      businessesFollowed: customer.customer_business_relations.length,
      mukandoGroupsJoined: customer.mukando_memberships.length,
      mukandoGroupsCreated: customer.created_mukando_groups.length,
      offersRedeemed: customer.redeemed_offers.length,
      loyaltyTier: customer.loyalty_tier,
      accountAge,
      mukandoContributions: customer.mukando_contributions.length,
      totalMukandoPointsContributed,
      firstTransactionDate,
      lastTransactionDate,
    };
  }

  /**
   * Check if a customer meets the criteria for a badge
   */
  checkBadgeCriteria(stats: CustomerStats, criteria: BadgeCriteria): boolean {
    const { type, conditions } = criteria;

    switch (type) {
      case 'threshold':
        if (conditions.field && conditions.operator && conditions.value !== undefined) {
          const fieldValue = stats[conditions.field as keyof CustomerStats] as number;
          switch (conditions.operator) {
            case 'gte': return fieldValue >= conditions.value;
            case 'lte': return fieldValue <= conditions.value;
            case 'gt': return fieldValue > conditions.value;
            case 'lt': return fieldValue < conditions.value;
            case 'eq': return fieldValue === conditions.value;
            default: return false;
          }
        }
        break;

      case 'achievement':
        if (conditions.field === 'account_created') {
          return true; // If we have stats, account exists
        }
        if (conditions.field === 'loyaltyTier' && conditions.value) {
          return stats.loyaltyTier === conditions.value;
        }
        break;

      case 'combination':
        if (conditions.subCriteria) {
          return conditions.subCriteria.every(subCriteria => 
            this.checkBadgeCriteria(stats, subCriteria)
          );
        }
        break;

      default:
        return false;
    }

    return false;
  }

  /**
   * Get all badges earned by a customer
   */
  async getCustomerBadges(customerId: string) {
    return await prisma.customerBadge.findMany({
      where: { customer_id: customerId },
      include: {
        badge: true
      },
      orderBy: { earned_at: 'desc' }
    });
  }

  /**
   * Award a badge to a customer
   */
  async awardBadge(customerId: string, badgeId: string): Promise<boolean> {
    try {
      // Check if customer already has this badge
      const existingBadge = await prisma.customerBadge.findUnique({
        where: {
          customer_id_badge_id: {
            customer_id: customerId,
            badge_id: badgeId
          }
        }
      });

      if (existingBadge) {
        return false; // Badge already earned
      }

      // Get badge details for points reward
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId }
      });

      if (!badge) {
        throw new Error(`Badge not found: ${badgeId}`);
      }

      // Award the badge and points in a transaction
      await prisma.$transaction(async (tx) => {
        // Create badge record
        await tx.customerBadge.create({
          data: {
            customer_id: customerId,
            badge_id: badgeId
          }
        });

        // Award points if badge has reward points
        if (badge.points_reward > 0) {
          await tx.customer.update({
            where: { user_id: customerId },
            data: {
              loyalty_points: {
                increment: badge.points_reward
              }
            }
          });

          // Create transaction record for badge points
          await tx.transaction.create({
            data: {
              customer_id: customerId,
              transaction_type: 'badge_earned',
              points_earned: badge.points_reward,
              transaction_amount: 0
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error(`Error awarding badge ${badgeId} to customer ${customerId}:`, error);
      return false;
    }
  }

  /**
   * Check and award eligible badges for a customer
   */
  async checkAndAwardBadges(customerId: string): Promise<string[]> {
    const stats = await this.getCustomerStats(customerId);
    const existingBadges = await this.getCustomerBadges(customerId);
    const existingBadgeIds = new Set(existingBadges.map(cb => cb.badge.name));
    
    const awardedBadges: string[] = [];

    // Get all active badges from database
    const allBadges = await prisma.badge.findMany({
      where: { is_active: true }
    });

    for (const badge of allBadges) {
      // Skip if already earned
      if (existingBadgeIds.has(badge.name)) {
        continue;
      }

      // Check if criteria is met
      const criteria = badge.criteria_json as BadgeCriteria;
      if (this.checkBadgeCriteria(stats, criteria)) {
        const awarded = await this.awardBadge(customerId, badge.id);
        if (awarded) {
          awardedBadges.push(badge.name);
        }
      }
    }

    return awardedBadges;
  }

  /**
   * Initialize all predefined badges in the database
   */
  async initializeBadges(): Promise<void> {
    console.log('Initializing badge system...');
    
    for (const badgeDef of BADGE_DEFINITIONS) {
      try {
        await prisma.badge.upsert({
          where: { name: badgeDef.name },
          update: {
            description: badgeDef.description,
            icon: badgeDef.icon,
            category: badgeDef.category,
            criteria_json: badgeDef.criteria,
            points_reward: badgeDef.pointsReward,
            is_active: true
          },
          create: {
            name: badgeDef.name,
            description: badgeDef.description,
            icon: badgeDef.icon,
            category: badgeDef.category,
            criteria_json: badgeDef.criteria,
            points_reward: badgeDef.pointsReward,
            is_active: true
          }
        });
        console.log(`✅ Badge initialized: ${badgeDef.name}`);
      } catch (error) {
        console.error(`❌ Failed to initialize badge ${badgeDef.name}:`, error);
      }
    }
    
    console.log('Badge system initialization complete!');
  }

  /**
   * Award badges to all existing customers based on their current data
   */
  async awardRetroactiveBadges(): Promise<void> {
    console.log('Starting retroactive badge awarding...');
    
    // Get all customers
    const customers = await prisma.customer.findMany({
      select: { user_id: true, full_name: true }
    });

    let totalAwarded = 0;
    
    for (const customer of customers) {
      try {
        const awardedBadges = await this.checkAndAwardBadges(customer.user_id);
        totalAwarded += awardedBadges.length;
        
        if (awardedBadges.length > 0) {
          console.log(`✅ ${customer.full_name || customer.user_id}: ${awardedBadges.length} badges awarded`);
          console.log(`   Badges: ${awardedBadges.join(', ')}`);
        }
      } catch (error) {
        console.error(`❌ Error processing customer ${customer.user_id}:`, error);
      }
    }
    
    console.log(`🎉 Retroactive badge awarding complete! Total badges awarded: ${totalAwarded}`);
  }
}

// Export singleton instance
export const badgeEngine = new BadgeEngine();
