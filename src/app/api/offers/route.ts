import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius') || 5000; // 5km radius by default

    let offers;

    if (businessId) {
      // Get offers for a specific business
      offers = await prisma.offer.findMany({
        where: { 
          business_id: businessId,
          OR: [
            { active_to: null },
            { active_to: { gte: new Date() } }
          ]
        },
        include: {
          business: {
            select: {
              business_name: true,
              business_category: true,
              latitude: true,
              longitude: true,
            }
          }
        },
        orderBy: { active_from: 'desc' },
      });
    } else if (latitude && longitude) {
      // Get offers near a location (simplified without PostGIS)
      // For now, just get all offers and we can add distance calculation later
      offers = await prisma.offer.findMany({
        where: {
          OR: [
            { active_to: null },
            { active_to: { gte: new Date() } }
          ]
        },
        include: {
          business: {
            select: {
              business_name: true,
              business_category: true,
              latitude: true,
              longitude: true,
            }
          }
        },
        orderBy: { active_from: 'desc' },
      });
    } else {
      // Get all active offers
      offers = await prisma.offer.findMany({
        where: {
          OR: [
            { active_to: null },
            { active_to: { gte: new Date() } }
          ]
        },
        include: {
          business: {
            select: {
              business_name: true,
              business_category: true,
            }
          }
        },
        orderBy: { active_from: 'desc' },
      });
    }

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Get offers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
