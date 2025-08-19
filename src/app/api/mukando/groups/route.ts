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
    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const userType = searchParams.get('userType'); // 'customer' or 'business'
    const status = searchParams.get('status'); // Filter by status

    console.log('📋 Fetching Mukando groups:', { userId, userType, status });

    if (userType === 'business') {
      // Business view: Get all groups for their business
      const whereClause: any = {
        business_id: userId
      };

      if (status) {
        whereClause.status = status;
      }

      const groups = await prisma.mukandoGroup.findMany({
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
            },
            orderBy: {
              payout_order: 'asc'
            }
          },
          contributions: {
            include: {
              customer: {
                select: {
                  user_id: true,
                  full_name: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            },
            take: 10 // Recent contributions
          },
          business: {
            select: {
              business_name: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return NextResponse.json({
        groups: groups.map(group => ({
          ...group,
          progressPercentage: Math.round((group.total_mukando_points / group.goal_points_required) * 100),
          memberCount: group.members.length,
          contributionCount: group.contributions.length
        }))
      });

    } else {
      // Customer view: Get groups the customer is part of or created
      const whereClause: any = {
        OR: [
          { creator_id: userId },
          {
            members: {
              some: {
                customer_id: userId
              }
            }
          }
        ]
      };

      if (status) {
        whereClause.status = status;
      }

      const groups = await prisma.mukandoGroup.findMany({
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
            },
            orderBy: {
              payout_order: 'asc'
            }
          },
          business: {
            select: {
              user_id: true,
              business_name: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      // Add customer-specific information
      const groupsWithCustomerInfo = groups.map(group => {
        const customerMembership = group.members.find(m => m.customer_id === userId);
        const isCreator = group.creator_id === userId;
        
        return {
          ...group,
          progressPercentage: Math.round((group.total_mukando_points / group.goal_points_required) * 100),
          memberCount: group.members.length,
          isCreator,
          isMember: !!customerMembership,
          customerContribution: customerMembership?.points_contributed || 0,
          payoutOrder: customerMembership?.payout_order || null
        };
      });

      return NextResponse.json({
        groups: groupsWithCustomerInfo
      });
    }

  } catch (error) {
    console.error('❌ Fetch Mukando groups error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token', code: 'STALE_TOKEN' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
