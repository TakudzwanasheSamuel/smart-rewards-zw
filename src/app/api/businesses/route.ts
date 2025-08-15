import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where: any = {};
    if (category) {
      where.business_category = category;
    }

    const businesses = await prisma.business.findMany({ where });

    return NextResponse.json(businesses);
  } catch (error) {
    console.error('Get businesses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
