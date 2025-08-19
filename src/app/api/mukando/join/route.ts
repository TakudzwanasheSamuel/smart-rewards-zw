import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { mukandoGroupId } = await req.json();

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const customerId = decoded.userId;

    console.log('🤝 Customer joining Mukando group:', {
      mukandoGroupId,
      customerId
    });

    // Validate required fields
    if (!mukandoGroupId) {
      return NextResponse.json({ 
        error: 'Missing mukandoGroupId' 
      }, { status: 400 });
    }

    // Find the Mukando group
    const mukandoGroup = await prisma.mukandoGroup.findUnique({
      where: { id: mukandoGroupId },
      include: {
        members: true,
        business: {
          select: {
            business_name: true
          }
        }
      }
    });

    if (!mukandoGroup) {
      return NextResponse.json({ 
        error: 'Mukando group not found' 
      }, { status: 404 });
    }

    if (mukandoGroup.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Group is not approved yet' 
      }, { status: 400 });
    }

    // Check if customer is already a member
    const existingMembership = await prisma.mukandoMember.findFirst({
      where: {
        group_id: mukandoGroupId,
        customer_id: customerId
      }
    });

    if (existingMembership) {
      return NextResponse.json({ 
        error: 'You are already a member of this group' 
      }, { status: 400 });
    }

    // Check if group is full
    if (mukandoGroup.max_members && mukandoGroup.members.length >= mukandoGroup.max_members) {
      return NextResponse.json({ 
        error: 'Group is full' 
      }, { status: 400 });
    }

    // Validate that customer exists
    const customer = await prisma.customer.findUnique({
      where: { user_id: customerId }
    });

    if (!customer) {
      return NextResponse.json({ 
        error: 'Access denied. Customer account required.' 
      }, { status: 403 });
    }

    // Calculate the next payout order
    const nextPayoutOrder = mukandoGroup.members.length + 1;

    // Add customer to the group
    const membership = await prisma.mukandoMember.create({
      data: {
        group_id: mukandoGroupId,
        customer_id: customerId,
        payout_order: nextPayoutOrder
      },
      include: {
        customer: {
          select: {
            user_id: true,
            full_name: true
          }
        },
        group: {
          select: {
            goal_name: true,
            business: {
              select: {
                business_name: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Customer joined Mukando group successfully:', {
      groupId: mukandoGroupId,
      customerId,
      payoutOrder: nextPayoutOrder
    });

    return NextResponse.json({
      message: 'Successfully joined Mukando group',
      membership: membership
    });

  } catch (error) {
    console.error('❌ Join Mukando group error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token', code: 'STALE_TOKEN' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
