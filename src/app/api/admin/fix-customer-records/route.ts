import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log('🔧 Checking for users without corresponding customer/business records...');
    
    // Find users without customer records
    const usersWithoutCustomerRecords = await prisma.user.findMany({
      where: {
        user_type: 'customer',
        customer: null,
      },
    });

    // Find users without business records
    const usersWithoutBusinessRecords = await prisma.user.findMany({
      where: {
        user_type: 'business',
        business: null,
      },
    });

    console.log(`Found ${usersWithoutCustomerRecords.length} users without customer records`);
    console.log(`Found ${usersWithoutBusinessRecords.length} users without business records`);

    // Create missing customer records
    for (const user of usersWithoutCustomerRecords) {
      console.log(`Creating customer record for user ${user.email}`);
      await prisma.customer.create({
        data: {
          user_id: user.id,
          full_name: '',
          loyalty_points: 0,
          eco_points: 0,
          loyalty_tier: 'Bronze',
        },
      });
    }

    // Create missing business records
    for (const user of usersWithoutBusinessRecords) {
      console.log(`Creating business record for user ${user.email}`);
      await prisma.business.create({
        data: {
          user_id: user.id,
          business_name: '',
          business_category: '',
        },
      });
    }

    return NextResponse.json({
      message: 'Database records fixed successfully',
      customersCreated: usersWithoutCustomerRecords.length,
      businessesCreated: usersWithoutBusinessRecords.length,
    });
  } catch (error) {
    console.error('❌ Fix records error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
