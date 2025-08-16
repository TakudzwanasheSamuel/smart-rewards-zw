import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius') || 5000; // 5km radius by default

    if (latitude && longitude) {
      await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS postgis;`);

      const businesses = await prisma.$queryRaw`
        SELECT *, ST_Distance(location, ST_MakePoint(${parseFloat(longitude)}, ${parseFloat(latitude)})::geography) as distance
        FROM "Business"
        WHERE ST_DWithin(location, ST_MakePoint(${parseFloat(longitude)}, ${parseFloat(latitude)})::geography, ${radius})
        ORDER BY distance;
      `;
      return NextResponse.json(businesses);
    } else {
      const where: any = {};
      if (category) {
        where.business_category = category;
      }
      const businesses = await prisma.business.findMany({ where });
      return NextResponse.json(businesses);
    }
  } catch (error) {
    console.error('Get businesses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
