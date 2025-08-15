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

    const relations = await prisma.customerBusinessRelation.findMany({
      where: { business_id: businessId },
      include: {
        customer: true,
      },
    });

    const customers = relations.map((relation) => relation.customer);

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
