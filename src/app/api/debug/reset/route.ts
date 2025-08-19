import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🧹 Starting database reset...');

    // Delete in correct order to handle foreign key constraints
    const deletedTransactions = await prisma.transaction.deleteMany({});
    console.log('✅ Deleted transactions:', deletedTransactions.count);

    const deletedContributions = await prisma.mukandoContribution.deleteMany({});
    console.log('✅ Deleted mukando contributions:', deletedContributions.count);

    const deletedGroups = await prisma.mukandoGroup.deleteMany({});
    console.log('✅ Deleted mukando groups:', deletedGroups.count);

    const deletedRelations = await prisma.customerBusinessRelation.deleteMany({});
    console.log('✅ Deleted customer business relations:', deletedRelations.count);

    const deletedOffers = await prisma.offer.deleteMany({});
    console.log('✅ Deleted offers:', deletedOffers.count);

    const deletedRules = await prisma.loyaltyRule.deleteMany({});
    console.log('✅ Deleted loyalty rules:', deletedRules.count);

    const deletedCustomers = await prisma.customer.deleteMany({});
    console.log('✅ Deleted customers:', deletedCustomers.count);

    const deletedBusinesses = await prisma.business.deleteMany({});
    console.log('✅ Deleted businesses:', deletedBusinesses.count);

    const deletedUsers = await prisma.user.deleteMany({});
    console.log('✅ Deleted users:', deletedUsers.count);

    console.log('🎉 Database reset completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database reset successfully',
      deleted_tables: [
        'transactions',
        'mukando_contributions', 
        'mukando_groups',
        'customer_business_relations',
        'offers',
        'loyalty_rules',
        'customers',
        'businesses',
        'users'
      ]
    });

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset database' },
      { status: 500 }
    );
  }
}
