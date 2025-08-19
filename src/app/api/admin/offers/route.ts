import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getBusinessIdFromToken(req: NextRequest) {
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
    const businessId = await getBusinessIdFromToken(req);
    if (!businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offers = await prisma.offer.findMany({
      where: { business_id: businessId },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Get offers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('🚀 POST /api/admin/offers - Starting offer creation');
  
  try {
    // Log request headers
    const authHeader = req.headers.get('authorization');
    console.log('🔑 Authorization header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'missing');
    
    const businessId = await getBusinessIdFromToken(req);
    console.log('👤 Business ID from token:', businessId);
    
    if (!businessId) {
      console.log('❌ No business ID found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify business exists (in case of stale tokens after database reset)
    const business = await prisma.business.findUnique({
      where: { user_id: businessId }
    });
    
    if (!business) {
      console.log('❌ Business not found in database - likely stale token after reset');
      return NextResponse.json({ 
        error: 'Business account not found. Please log out and log back in.',
        code: 'STALE_TOKEN'
      }, { status: 401 });
    }

    const body = await req.json();
    console.log('📝 Request body:', body);

    if (!body.offer_name || !body.description) {
      console.log('❌ Missing required fields:', { offer_name: body.offer_name, description: body.description });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('💾 Creating offer in database...');
    const newOffer = await prisma.offer.create({
      data: {
        ...body,
        business_id: businessId,
      },
    });
    
    console.log('✅ Offer created successfully:', newOffer);
    return NextResponse.json(newOffer, { status: 201 });
    
  } catch (error) {
    console.error('❌ Create offer error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
