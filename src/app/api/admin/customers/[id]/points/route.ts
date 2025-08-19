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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const businessId = await getBusinessIdFromToken(req);
    if (!businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: customerId } = await params;
    const { loyalty_points, eco_points } = await req.json();

    if (loyalty_points === undefined && eco_points === undefined) {
      return NextResponse.json({ error: 'Missing points fields' }, { status: 400 });
    }

    const data: any = {};
    if (loyalty_points !== undefined) {
      data.loyalty_points = { increment: loyalty_points };
    }
    if (eco_points !== undefined) {
      data.eco_points = { increment: eco_points };
    }

    await prisma.customer.update({
      where: { user_id: customerId },
      data,
    });

    await prisma.auditLog.create({
      data: {
        user_id: businessId,
        action: 'manual_points_adjustment',
        details: {
          customerId,
          loyalty_points,
          eco_points,
        },
      },
    });

    return NextResponse.json({ message: 'Points adjusted successfully' });
  } catch (error) {
    console.error('Adjust points error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
