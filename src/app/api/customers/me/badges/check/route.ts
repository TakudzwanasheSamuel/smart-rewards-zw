import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

async function getUserIdFromToken(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the badge engine to check for new badges
    const { badgeEngine } = await import('@/lib/badges/badge-engine');
    
    // Check for new badges
    const result = await badgeEngine.checkAndAwardBadges(userId);
    
    if (result.count > 0) {
      // Return the new badges that were awarded
      return NextResponse.json({
        success: true,
        count: result.count,
        newBadges: result.newBadges,
        message: `Congratulations! You've earned ${result.count} new badge${result.count > 1 ? 's' : ''}!`
      });
    } else {
      // No new badges
      return NextResponse.json({
        success: true,
        count: 0,
        newBadges: [],
        message: 'No new badges earned at this time. Keep up the great work!'
      });
    }

  } catch (error) {
    console.error('Error checking for new badges:', error);
    return NextResponse.json(
      { error: 'Failed to check for new badges' },
      { status: 500 }
    );
  }
}
