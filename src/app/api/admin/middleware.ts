import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.user_type !== 'business') {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    return NextResponse.next();
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
}

export const config = {
  matcher: '/api/admin/:path*',
};
