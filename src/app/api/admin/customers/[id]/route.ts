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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const businessId = await getBusinessIdFromToken(req);
    if (!businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: customerId } = params;

    const customer = await prisma.customer.findUnique({
      where: { user_id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        customer_id: customerId,
        business_id: businessId,
      },
    });

    return NextResponse.json({ customer, transactions });
  } catch (error) {
    console.error('Get customer details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
