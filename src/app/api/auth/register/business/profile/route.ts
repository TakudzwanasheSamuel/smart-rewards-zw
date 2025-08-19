import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

export async function PUT(req: NextRequest) {
  try {
    const {
      business_name,
      business_category,
      description,
      contact_phone,
      address,
      logo_url,
      location
    } = await req.json();

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    console.log('🏢 Updating business profile:', {
      userId,
      business_name,
      business_category,
      contact_phone,
      address,
      logo_url,
      location
    });

    // Validate required fields
    if (!business_name || !business_category || !contact_phone || !address) {
      return NextResponse.json({ 
        error: 'Missing required fields: business_name, business_category, contact_phone, address' 
      }, { status: 400 });
    }

    // Validate location format (GeoJSON Point)
    if (location && (!location.type || location.type !== 'Point' || !Array.isArray(location.coordinates) || location.coordinates.length !== 2)) {
      return NextResponse.json({ 
        error: 'Invalid location format. Expected GeoJSON Point with coordinates [longitude, latitude]' 
      }, { status: 400 });
    }

    // Check if user exists and is a business
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.user_type !== 'business') {
      return NextResponse.json({ error: 'User is not a business account' }, { status: 403 });
    }

    // Extract latitude and longitude from location object
    let latitude = null;
    let longitude = null;
    if (location && location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      longitude = location.coordinates[0];
      latitude = location.coordinates[1];
    }

    // Update business profile
    const business = await prisma.business.upsert({
      where: { user_id: userId },
      update: {
        business_name,
        business_category,
        description: description || null,
        contact_phone,
        address,
        logo_url: logo_url || null,
        latitude: latitude,
        longitude: longitude,
      },
      create: {
        user_id: userId,
        business_name,
        business_category,
        description: description || null,
        contact_phone,
        address,
        logo_url: logo_url || null,
        latitude: latitude,
        longitude: longitude,
      }
    });

    console.log('✅ Business profile updated successfully:', business);

    return NextResponse.json({
      message: 'Business profile updated successfully',
      business: {
        ...business,
        location: business.longitude && business.latitude ? {
          type: 'Point',
          coordinates: [business.longitude, business.latitude]
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Business profile update error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token', code: 'STALE_TOKEN' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to fetch current business profile
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

    // Fetch business profile
    const business = await prisma.business.findUnique({
      where: { user_id: userId }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      business: {
        ...business,
        location: business.longitude && business.latitude ? {
          type: 'Point',
          coordinates: [business.longitude, business.latitude]
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Business profile fetch error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token', code: 'STALE_TOKEN' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
