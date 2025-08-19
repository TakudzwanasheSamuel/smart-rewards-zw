import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

export async function PUT(req: NextRequest) {
  try {
    const { latitude, longitude } = await req.json();

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 });
    }

    // Get business ID from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const businessId = decoded.userId;

    console.log('🏢 Updating business location:', { businessId, latitude, longitude });

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { user_id: businessId }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Update business location
    const updatedBusiness = await prisma.business.update({
      where: { user_id: businessId },
      data: {
        latitude,
        longitude,
      }
    });

    console.log('✅ Business location updated successfully');

    return NextResponse.json({
      message: 'Location updated successfully',
      location: {
        latitude: updatedBusiness.latitude,
        longitude: updatedBusiness.longitude
      }
    });

  } catch (error) {
    console.error('❌ Update business location error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
