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

// GET /api/badges - Get all available badges or customer's badges
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const includeEarned = searchParams.get('includeEarned') === 'true';

    if (customerId) {
      // Get badges for a specific customer with fallback
      let customerBadges;
      try {
        if (prisma.customerBadge) {
          customerBadges = await prisma.customerBadge.findMany({
            where: { customer_id: customerId },
            include: {
              badge: true
            },
            orderBy: { earned_at: 'desc' }
          });
        } else {
          // Raw SQL fallback
          customerBadges = await prisma.$queryRaw`
            SELECT 
              cb.*,
              b.name as badge_name,
              b.description as badge_description,
              b.icon as badge_icon,
              b.category as badge_category,
              b.points_reward as badge_points_reward
            FROM "CustomerBadge" cb
            JOIN "Badge" b ON cb.badge_id = b.id
            WHERE cb.customer_id = ${customerId}
            ORDER BY cb.earned_at DESC
          `;
          
          customerBadges = (customerBadges as any[]).map((row: any) => ({
            ...row,
            badge: {
              id: row.badge_id,
              name: row.badge_name,
              description: row.badge_description,
              icon: row.badge_icon,
              category: row.badge_category,
              points_reward: row.badge_points_reward
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching customer badges:', error);
        customerBadges = [];
      }

      if (includeEarned) {
        // Also get all available badges and mark which ones are earned
        let allBadges;
        try {
          if (prisma.badge) {
            allBadges = await prisma.badge.findMany({
              where: { is_active: true },
              orderBy: { category: 'asc' }
            });
          } else {
            allBadges = await prisma.$queryRaw`
              SELECT * FROM "Badge" WHERE is_active = true ORDER BY category ASC
            `;
          }
        } catch (error) {
          console.error('Error fetching all badges:', error);
          allBadges = [];
        }

        const earnedBadgeIds = new Set(customerBadges.map(cb => cb.badge_id));
        
        const badgesWithStatus = allBadges.map(badge => ({
          ...badge,
          isEarned: earnedBadgeIds.has(badge.id),
          earnedAt: customerBadges.find(cb => cb.badge_id === badge.id)?.earned_at || null
        }));

        return NextResponse.json({
          earnedBadges: customerBadges,
          allBadges: badgesWithStatus
        });
      }

      return NextResponse.json(customerBadges);
    }

    // Get all available badges with fallback
    let badges;
    try {
      if (prisma.badge) {
        badges = await prisma.badge.findMany({
          where: { is_active: true },
          orderBy: [{ category: 'asc' }, { name: 'asc' }]
        });
      } else {
        badges = await prisma.$queryRaw`
          SELECT * FROM "Badge" 
          WHERE is_active = true 
          ORDER BY category ASC, name ASC
        `;
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      badges = [];
    }

    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/badges/initialize - Initialize badge system (dev endpoint)
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    
    if (action === 'initialize') {
      await badgeEngine.initializeBadges();
      return NextResponse.json({ message: 'Badge system initialized successfully' });
    }
    
    if (action === 'retroactive') {
      await badgeEngine.awardRetroactiveBadges();
      return NextResponse.json({ message: 'Retroactive badges awarded successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in badge action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
