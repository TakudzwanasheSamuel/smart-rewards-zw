import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/redeem-offer - Customer initiates redemption
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 POST /api/redeem-offer - Starting offer redemption');

    // Get authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header found');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.log('❌ Invalid token');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const customerId = decoded.userId;
    console.log('👤 Customer ID from token:', customerId);

    // Parse request body
    const { offerId } = await request.json();
    console.log('📝 Request body:', { offerId });

    if (!offerId) {
      return NextResponse.json(
        { error: 'Offer ID is required' },
        { status: 400 }
      );
    }

    // 1. Validate the Offer
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { business: true }
    });

    if (!offer) {
      console.log('❌ Offer not found');
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    if (!offer.is_redeemable) {
      console.log('❌ Offer is not redeemable');
      return NextResponse.json(
        { error: 'This offer is currently not available for redemption' },
        { status: 400 }
      );
    }

    // Check if offer is active (if dates are set)
    const now = new Date();
    if (offer.active_from && now < offer.active_from) {
      return NextResponse.json(
        { error: 'This offer is not yet active' },
        { status: 400 }
      );
    }

    if (offer.active_to && now > offer.active_to) {
      return NextResponse.json(
        { error: 'This offer has expired' },
        { status: 400 }
      );
    }

    // 2. Check Customer's Points
    const customer = await prisma.customer.findUnique({
      where: { user_id: customerId }
    });

    if (!customer) {
      console.log('❌ Customer not found');
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const pointsRequired = offer.points_required || 0;
    if (customer.loyalty_points < pointsRequired) {
      console.log(`❌ Insufficient points: has ${customer.loyalty_points}, needs ${pointsRequired}`);
      return NextResponse.json(
        { 
          error: 'Insufficient points',
          current_points: customer.loyalty_points,
          required_points: pointsRequired
        },
        { status: 400 }
      );
    }

    // 3. Generate unique redemption code
    const redemptionCode = `RDM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    console.log('🔑 Generated redemption code:', redemptionCode);

    // 4. Perform atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct points from customer
      const updatedCustomer = await tx.customer.update({
        where: { user_id: customerId },
        data: {
          loyalty_points: {
            decrement: pointsRequired
          }
        }
      });

      // Create redeemed offer record
      const redeemedOffer = await tx.redeemedOffer.create({
        data: {
          customer_id: customerId,
          offer_id: offerId,
          business_id: offer.business_id,
          redemption_code: redemptionCode,
        }
      });

      // Log transaction for auditing
      await tx.transaction.create({
        data: {
          customer_id: customerId,
          business_id: offer.business_id,
          transaction_type: 'redemption',
          points_deducted: pointsRequired,
          offer_id: offerId,
        }
      });

      // Create redemption code record
      await tx.redemptionCode.create({
        data: {
          offer_id: offerId,
          code: redemptionCode,
          customer_id: customerId,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        }
      });

      return {
        updatedCustomer,
        redeemedOffer,
        redemptionCode
      };
    });

    console.log('✅ Redemption successful');
    console.log('📊 New customer balance:', result.updatedCustomer.loyalty_points);

    return NextResponse.json({
      success: true,
      message: 'Offer redeemed successfully',
      redemption_code: redemptionCode,
      new_balance: result.updatedCustomer.loyalty_points,
      points_deducted: pointsRequired,
      offer: {
        id: offer.id,
        name: offer.offer_name,
        description: offer.description,
        business_name: offer.business.business_name
      }
    });

  } catch (error) {
    console.error('❌ Redemption error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem offer' },
      { status: 500 }
    );
  }
}

// PUT /api/redeem-offer - Business verifies redemption
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 PUT /api/redeem-offer - Starting redemption verification');

    // Get authorization token (business)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header found');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.log('❌ Invalid token');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const businessId = decoded.userId; // For business users, userId is the business_id
    console.log('🏢 Business ID from token:', businessId);

    // Parse request body
    const { redemptionCode } = await request.json();
    console.log('📝 Verification request:', { redemptionCode });

    if (!redemptionCode) {
      return NextResponse.json(
        { error: 'Redemption code is required' },
        { status: 400 }
      );
    }

    // Find the redemption code
    const codeRecord = await prisma.redemptionCode.findUnique({
      where: { code: redemptionCode },
      include: {
        offer: {
          include: {
            business: true
          }
        }
      }
    });

    if (!codeRecord) {
      console.log('❌ Redemption code not found');
      return NextResponse.json(
        { error: 'Invalid redemption code' },
        { status: 404 }
      );
    }

    // Check if code belongs to this business
    if (codeRecord.offer.business_id !== businessId) {
      console.log('❌ Code does not belong to this business');
      return NextResponse.json(
        { error: 'This redemption code is not valid for your business' },
        { status: 403 }
      );
    }

    // Check if code is already used
    if (codeRecord.is_used) {
      console.log('❌ Code already used');
      return NextResponse.json(
        { error: 'This redemption code has already been used' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (codeRecord.expires_at && new Date() > codeRecord.expires_at) {
      console.log('❌ Code has expired');
      return NextResponse.json(
        { error: 'This redemption code has expired' },
        { status: 400 }
      );
    }

    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { user_id: codeRecord.customer_id! },
      include: { user: true }
    });

    // Mark code as used
    await prisma.redemptionCode.update({
      where: { code: redemptionCode },
      data: {
        is_used: true,
        used_at: new Date()
      }
    });

    console.log('✅ Redemption verified successfully');

    return NextResponse.json({
      success: true,
      message: 'Redemption verified successfully',
      customer: {
        name: customer?.full_name || customer?.user.email || 'Unknown',
        email: customer?.user.email,
        current_points: customer?.loyalty_points || 0,
        tier: customer?.loyalty_tier || 'Bronze'
      },
      offer: {
        id: codeRecord.offer.id,
        name: codeRecord.offer.offer_name,
        description: codeRecord.offer.description,
        points_required: codeRecord.offer.points_required
      },
      redemption_details: {
        code: redemptionCode,
        verified_at: new Date(),
        business_name: codeRecord.offer.business.business_name
      }
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify redemption' },
      { status: 500 }
    );
  }
}
