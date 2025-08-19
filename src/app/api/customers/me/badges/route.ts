import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { badgeEngine } from '@/lib/badges/badge-engine';
import jwt from 'jsonwebtoken';

async function getUserIdFromToken(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// GET /api/customers/me/badges - Get current customer's badges
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Badge API: prisma object:', !!prisma);
    console.log('Badge API: customerBadge available:', !!prisma.customerBadge);
    console.log('Badge API: badge available:', !!prisma.badge);

    const { searchParams } = new URL(req.url);
    const includeAvailable = searchParams.get('includeAvailable') === 'true';

    // Temporary workaround: Use raw SQL queries if Prisma models aren't available
    let earnedBadges;
    try {
      if (prisma.customerBadge) {
        earnedBadges = await prisma.customerBadge.findMany({
          where: { customer_id: userId },
          include: {
            badge: true
          },
          orderBy: { earned_at: 'desc' }
        });
      } else {
        // Fallback to raw SQL query
        console.log('Badge API: Using raw SQL fallback');
        earnedBadges = await prisma.$queryRaw`
          SELECT 
            cb.id,
            cb.customer_id,
            cb.badge_id,
            cb.earned_at,
            b.id as badge_id_nested,
            b.name as badge_name,
            b.description as badge_description,
            b.icon as badge_icon,
            b.category as badge_category,
            b.points_reward as badge_points_reward
          FROM "CustomerBadge" cb
          JOIN "Badge" b ON cb.badge_id = b.id
          WHERE cb.customer_id = ${userId}
          ORDER BY cb.earned_at DESC
        `;
        
        // Transform raw results to match expected format
        earnedBadges = (earnedBadges as any[]).map((row: any) => ({
          id: row.id,
          customer_id: row.customer_id,
          badge_id: row.badge_id,
          earned_at: row.earned_at,
          badge: {
            id: row.badge_id_nested,
            name: row.badge_name,
            description: row.badge_description,
            icon: row.badge_icon,
            category: row.badge_category,
            points_reward: row.badge_points_reward
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      earnedBadges = [];
    }

    if (includeAvailable) {
      // Get all available badges with fallback
      let allBadges;
      try {
        if (prisma.badge) {
          allBadges = await prisma.badge.findMany({
            where: { is_active: true },
            orderBy: [{ category: 'asc' }, { name: 'asc' }]
          });
        } else {
          // Raw SQL fallback
          allBadges = await prisma.$queryRaw`
            SELECT * FROM "Badge" 
            WHERE is_active = true 
            ORDER BY category ASC, name ASC
          `;
        }
      } catch (error) {
        console.error('Error fetching all badges:', error);
        allBadges = [];
      }

      const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badge_id));
      
      const badgesWithStatus = allBadges.map(badge => ({
        ...badge,
        isEarned: earnedBadgeIds.has(badge.id),
        earnedAt: earnedBadges.find(eb => eb.badge_id === badge.id)?.earned_at || null
      }));

      return NextResponse.json({
        earnedBadges,
        allBadges: badgesWithStatus,
        totalEarned: earnedBadges.length,
        totalAvailable: allBadges.length
      });
    }

    return NextResponse.json({
      badges: earnedBadges,
      totalEarned: earnedBadges.length
    });
  } catch (error) {
    console.error('Error fetching customer badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/customers/me/badges/check - Manually check for new badges
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const awardedBadges = await badgeEngine.checkAndAwardBadges(userId);
    
    return NextResponse.json({
      message: 'Badge check completed',
      newBadges: awardedBadges,
      count: awardedBadges.length
    });
  } catch (error) {
    console.error('Error checking customer badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
