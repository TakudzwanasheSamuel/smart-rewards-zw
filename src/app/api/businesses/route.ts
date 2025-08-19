import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = parseFloat(searchParams.get('radius') || '10'); // Default 10km radius

    console.log('🏢 Fetching businesses with filters:', { 
      category, 
      latitude, 
      longitude, 
      radius 
    });

    const where: any = {};
    if (category && category !== 'all') {
      where.business_category = category;
    }

    let businesses = await prisma.business.findMany({ 
      where,
      include: {
        offers: {
          where: {
            is_redeemable: true,
            OR: [
              { active_to: null }, // No end date
              { active_to: { gte: new Date() } } // End date is in the future
            ],
            AND: [
              { 
                OR: [
                  { active_from: null }, // No start date
                  { active_from: { lte: new Date() } } // Start date is in the past or today
                ]
              }
            ]
          },
          take: 3, // Get up to 3 latest offers per business
          orderBy: {
            created_at: 'desc'
          },
          select: {
            id: true,
            offer_name: true,
            description: true,
            points_required: true,
          }
        }
      }
    });

    // Filter by location if provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      
      businesses = businesses
        .filter(business => business.latitude && business.longitude)
        .map(business => ({
          ...business,
          distance: calculateDistance(
            userLat, 
            userLng, 
            business.latitude!, 
            business.longitude!
          )
        }))
        .filter(business => business.distance <= radius)
        .sort((a, b) => a.distance - b.distance); // Sort by distance

      console.log(`📍 Found ${businesses.length} businesses within ${radius}km of user location`);
    } else {
      console.log(`📍 Found ${businesses.length} businesses (no location filter)`);
    }
    
    return NextResponse.json(businesses);
  } catch (error) {
    console.error('❌ Get businesses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
