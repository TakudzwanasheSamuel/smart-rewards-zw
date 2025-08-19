import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const customerId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    console.log('🔍 Fetching available Mukando groups:', { customerId, businessId });

    // Build where clause
    const whereClause: any = {
      status: 'approved',
      // Exclude groups where customer is already a member
      NOT: {
        members: {
          some: {
            customer_id: customerId
          }
        }
      }
    };

    // Filter by business if specified
    if (businessId) {
      whereClause.business_id = businessId;
    }

    const availableGroups = await prisma.mukandoGroup.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            user_id: true,
            full_name: true
          }
        },
        members: {
          include: {
            customer: {
              select: {
                user_id: true,
                full_name: true
              }
            }
          }
        },
        business: {
          select: {
            user_id: true,
            business_name: true,
            business_category: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Filter out full groups and add additional info
    const joinableGroups = availableGroups
      .filter(group => !group.max_members || group.members.length < group.max_members)
      .map(group => ({
        id: group.id,
        goal_name: group.goal_name,
        goal_points_required: group.goal_points_required,
        contribution_interval: group.contribution_interval,
        term_length: group.term_length,
        discount_rate: group.discount_rate,
        total_mukando_points: group.total_mukando_points,
        max_members: group.max_members,
        created_at: group.created_at,
        creator: group.creator,
        business: group.business,
        memberCount: group.members.length,
        spotsRemaining: group.max_members ? group.max_members - group.members.length : null,
        progressPercentage: Math.round((group.total_mukando_points / group.goal_points_required) * 100),
        members: group.members.map(member => ({
          customer: member.customer,
          payout_order: member.payout_order,
          points_contributed: member.points_contributed,
          joined_at: member.joined_at
        }))
      }));

    return NextResponse.json({
      availableGroups: joinableGroups,
      totalCount: joinableGroups.length
    });

  } catch (error) {
    console.error('❌ Fetch available Mukando groups error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token', code: 'STALE_TOKEN' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
