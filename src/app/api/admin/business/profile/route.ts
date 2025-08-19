import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    // Get business ID from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const businessId = decoded.userId;

    console.log('🏢 Fetching business profile:', { businessId });

    // Fetch business profile
    const business = await prisma.business.findUnique({
      where: { user_id: businessId },
      select: {
        user_id: true,
        business_name: true,
        business_category: true,
        description: true,
        contact_email: true,
        contact_phone: true,
        address: true,
        logo_url: true,
        website_url: true,
        latitude: true,
        longitude: true,
        shared_loyalty_id: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    console.log('✅ Business profile fetched successfully');

    return NextResponse.json(business);

  } catch (error) {
    console.error('❌ Get business profile error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token', code: 'STALE_TOKEN' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const {
      description,
      contact_email,
      contact_phone,
      address,
      website_url,
      business_category
    } = await req.json();

    // Get business ID from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const businessId = decoded.userId;

    console.log('🏢 Updating business profile:', { businessId });

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { user_id: businessId }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Update business profile
    const updatedBusiness = await prisma.business.update({
      where: { user_id: businessId },
      data: {
        description,
        contact_email,
        contact_phone,
        address,
        website_url,
        business_category,
      },
      select: {
        user_id: true,
        business_name: true,
        business_category: true,
        description: true,
        contact_email: true,
        contact_phone: true,
        address: true,
        logo_url: true,
        website_url: true,
        latitude: true,
        longitude: true,
        shared_loyalty_id: true,
        created_at: true,
        updated_at: true,
      }
    });

    console.log('✅ Business profile updated successfully');

    return NextResponse.json({
      message: 'Profile updated successfully',
      business: updatedBusiness
    });

  } catch (error) {
    console.error('❌ Update business profile error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token', code: 'STALE_TOKEN' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
