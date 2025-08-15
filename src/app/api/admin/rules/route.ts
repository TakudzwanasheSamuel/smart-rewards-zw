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

    const rules = await prisma.loyaltyRule.findMany({
      where: { business_id: businessId },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Get rules error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const businessId = await getBusinessIdFromToken(req);
    if (!businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rule_type, rule_json } = await req.json();

    if (!rule_type || !rule_json) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRule = await prisma.loyaltyRule.create({
      data: {
        business_id: businessId,
        rule_type,
        rule_json,
      },
    });

    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    console.error('Create rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
