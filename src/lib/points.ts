import { prisma } from '@/lib/db/prisma';
import { badgeEngine } from '@/lib/badges/badge-engine';

export interface PointsAward {
  customerId: string;
  businessId?: string;
  points: number;
  activity: string;
  description: string;
}

/**
 * Award points to a customer and optionally record the transaction
 */
export async function awardPoints({ 
  customerId, 
  businessId, 
  points, 
  activity, 
  description 
}: PointsAward) {
  try {
    console.log(`🎉 Awarding ${points} points to customer ${customerId} for: ${activity}`);

    // Update customer's loyalty points
    const updatedCustomer = await prisma.customer.update({
      where: { user_id: customerId },
      data: {
        loyalty_points: {
          increment: points
        }
      }
    });

    // Record transaction only for business-related activities
    if (businessId) {
      await prisma.transaction.create({
        data: {
          customer_id: customerId,
          business_id: businessId,
          transaction_amount: null,
          points_earned: points,
        }
      });
      console.log(`💾 Transaction recorded for business activity`);
    } else {
      console.log(`📝 Skipping transaction record for platform activity: ${activity}`);
    }

    console.log(`✅ Points awarded successfully. New total: ${updatedCustomer.loyalty_points}`);

    // Check for badge eligibility after awarding points
    try {
      const awardedBadges = await badgeEngine.checkAndAwardBadges(customerId);
      if (awardedBadges.length > 0) {
        console.log(`🏆 New badges earned: ${awardedBadges.join(', ')}`);
      }
    } catch (badgeError) {
      console.error('Error checking badges:', badgeError);
      // Don't fail the points award if badge check fails
    }

    return {
      success: true,
      pointsAwarded: points,
      newTotal: updatedCustomer.loyalty_points,
      activity,
      description
    };
  } catch (error) {
    console.error(`❌ Error awarding points for ${activity}:`, error);
    throw error;
  }
}

/**
 * Simple points award for platform activities (no transaction recording)
 */
export async function awardSignupPoints(customerId: string): Promise<{ pointsAwarded: number; newTotal: number }> {
  try {
    console.log(`🎉 Awarding signup bonus to customer ${customerId}`);

    const updatedCustomer = await prisma.customer.update({
      where: { user_id: customerId },
      data: {
        loyalty_points: {
          increment: POINTS_REWARDS.SIGNUP.points
        }
      }
    });

    console.log(`✅ Signup bonus awarded. New total: ${updatedCustomer.loyalty_points}`);

    // Check for badge eligibility after signup
    try {
      const awardedBadges = await badgeEngine.checkAndAwardBadges(customerId);
      if (awardedBadges.length > 0) {
        console.log(`🏆 New badges earned during signup: ${awardedBadges.join(', ')}`);
      }
    } catch (badgeError) {
      console.error('Error checking badges during signup:', badgeError);
      // Don't fail the signup if badge check fails
    }

    return {
      pointsAwarded: POINTS_REWARDS.SIGNUP.points,
      newTotal: updatedCustomer.loyalty_points
    };
  } catch (error) {
    console.error(`❌ Error awarding signup points:`, error);
    throw error;
  }
}

/**
 * Points reward constants
 */
export const POINTS_REWARDS = {
  SIGNUP: { points: 2, activity: 'signup', description: 'Welcome bonus for joining the platform' },
  FOLLOW_BUSINESS: { points: 1, activity: 'follow_business', description: 'Following a new business' },
  JOIN_MUKANDO: { points: 1, activity: 'join_mukando', description: 'Joining a Mukando group' },
  FIRST_PURCHASE: { points: 5, activity: 'first_purchase', description: 'Making your first purchase at a business' },
  REFERRAL: { points: 3, activity: 'referral', description: 'Referring a friend to the platform' }
} as const;
