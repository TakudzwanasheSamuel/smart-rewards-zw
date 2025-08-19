import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserIdFromToken(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    console.log('🔑 Getting notifications for user ID:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer to ensure they exist
    const customer = await prisma.customer.findUnique({
      where: { user_id: userId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // For now, generate mock notifications based on customer data
    // In a real app, you'd have a notifications table
    const notifications = [];

    // Check if customer recently reached a new tier
    if (customer.loyalty_points >= 1000 && customer.loyalty_tier === 'Silver') {
      notifications.push({
        id: 'tier_upgrade_silver',
        icon: 'Award',
        title: 'Tier Upgrade Available!',
        description: 'You have enough points for Silver tier. Your tier will be updated soon!',
        time: '2 hours ago',
        type: 'tier_upgrade',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Get recent offers (mock for now)
    const recentOffers = await prisma.offer.findMany({
      include: {
        business: {
          select: {
            business_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 3,
    });

    // Add offer notifications
    recentOffers.forEach((offer, index) => {
      notifications.push({
        id: `offer_${offer.id}`,
        icon: 'Gift',
        title: `New Offer from ${offer.business?.business_name || 'Business'}`,
        description: offer.description.substring(0, 100) + (offer.description.length > 100 ? '...' : ''),
        time: index === 0 ? '1 day ago' : `${index + 1} days ago`,
        type: 'offer',
        created_at: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
      });
    });

    // Add points expiring notification if customer has points
    if (customer.loyalty_points > 0) {
      notifications.push({
        id: 'points_expiring',
        icon: 'Clock',
        title: 'Points Activity Reminder',
        description: `You have ${customer.loyalty_points} points. Keep earning to maintain your tier status!`,
        time: '3 days ago',
        type: 'reminder',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Default welcome notification for new customers
    if (notifications.length === 0) {
      notifications.push({
        id: 'welcome',
        icon: 'Award',
        title: 'Welcome to Smart Rewards!',
        description: 'Start earning points by shopping at partner businesses and scanning receipts.',
        time: '1 week ago',
        type: 'welcome',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    console.log('📊 Generated', notifications.length, 'notifications');
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
