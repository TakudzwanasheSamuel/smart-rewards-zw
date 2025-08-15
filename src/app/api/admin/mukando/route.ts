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

    const mukandoGroups = await prisma.mukandoGroup.findMany({
      where: { business_id: businessId },
    });

    return NextResponse.json(mukandoGroups);
  } catch (error) {
    console.error('Get Mukando groups error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const businessId = await getBusinessIdFromToken(req);
    if (!businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { group_name } = await req.json();

    if (!group_name) {
      return NextResponse.json({ error: 'Missing group_name field' }, { status: 400 });
    }

    const newMukandoGroup = await prisma.mukandoGroup.create({
      data: {
        business_id: businessId,
        group_name,
      },
    });

    return NextResponse.json(newMukandoGroup, { status: 201 });
  } catch (error) {
    console.error('Create Mukando group error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
