import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const {
      mukandoGroupId,
      maxMembers,
      discountRate
    } = await req.json();

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const businessId = decoded.userId;

    console.log('✅ Approving Mukando group:', {
      mukandoGroupId,
      businessId,
      maxMembers,
      discountRate
    });

    // Validate required fields
    if (!mukandoGroupId || !maxMembers || discountRate === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: mukandoGroupId, maxMembers, discountRate' 
      }, { status: 400 });
    }

    // Find the Mukando group and verify business ownership
    const mukandoGroup = await prisma.mukandoGroup.findUnique({
      where: { id: mukandoGroupId },
      include: {
        creator: {
          select: {
            user_id: true,
            full_name: true
          }
        }
      }
    });

    if (!mukandoGroup) {
      return NextResponse.json({ 
        error: 'Mukando group not found' 
      }, { status: 404 });
    }

    if (mukandoGroup.business_id !== businessId) {
      return NextResponse.json({ 
        error: 'Unauthorized: This group does not belong to your business' 
      }, { status: 403 });
    }

    if (mukandoGroup.status !== 'pending_approval') {
      return NextResponse.json({ 
        error: 'Group is not pending approval' 
      }, { status: 400 });
    }

    // Update the group to approved status
    const updatedGroup = await prisma.mukandoGroup.update({
      where: { id: mukandoGroupId },
      data: {
        status: 'approved',
        max_members: maxMembers,
        discount_rate: discountRate,
        approved_at: new Date()
      },
      include: {
        creator: {
          select: {
            user_id: true,
            full_name: true
          }
        },
        business: {
          select: {
            user_id: true,
            business_name: true
          }
        }
      }
    });

    // Automatically add the creator as the first member
    await prisma.mukandoMember.create({
      data: {
        group_id: mukandoGroupId,
        customer_id: mukandoGroup.creator_id,
        payout_order: 1
      }
    });

    console.log('✅ Mukando group approved successfully:', mukandoGroupId);

    return NextResponse.json({
      message: 'Mukando group approved successfully',
      group: updatedGroup
    });

  } catch (error) {
    console.error('❌ Approve Mukando group error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token', code: 'STALE_TOKEN' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
