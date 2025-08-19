// Script to clear all database tables
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️ Starting database cleanup...');

    // Delete in reverse dependency order to avoid foreign key constraints
    
    // Delete AI insights first
    const aiInsightsDeleted = await prisma.aiInsight.deleteMany({});
    console.log(`✅ Deleted ${aiInsightsDeleted.count} AI insights`);

    // Delete redemption codes
    const redemptionCodesDeleted = await prisma.redemptionCode.deleteMany({});
    console.log(`✅ Deleted ${redemptionCodesDeleted.count} redemption codes`);

    // Delete redeemed offers
    const redeemedOffersDeleted = await prisma.redeemedOffer.deleteMany({});
    console.log(`✅ Deleted ${redeemedOffersDeleted.count} redeemed offers`);

    // Delete Mukando contributions
    const contributionsDeleted = await prisma.mukandoContribution.deleteMany({});
    console.log(`✅ Deleted ${contributionsDeleted.count} Mukando contributions`);

    // Delete Mukando members
    const membersDeleted = await prisma.mukandoMember.deleteMany({});
    console.log(`✅ Deleted ${membersDeleted.count} Mukando members`);

    // Delete Mukando groups
    const groupsDeleted = await prisma.mukandoGroup.deleteMany({});
    console.log(`✅ Deleted ${groupsDeleted.count} Mukando groups`);

    // Delete transactions
    const transactionsDeleted = await prisma.transaction.deleteMany({});
    console.log(`✅ Deleted ${transactionsDeleted.count} transactions`);

    // Delete offers
    const offersDeleted = await prisma.offer.deleteMany({});
    console.log(`✅ Deleted ${offersDeleted.count} offers`);

    // Delete customers
    const customersDeleted = await prisma.customer.deleteMany({});
    console.log(`✅ Deleted ${customersDeleted.count} customers`);

    // Delete businesses
    const businessesDeleted = await prisma.business.deleteMany({});
    console.log(`✅ Deleted ${businessesDeleted.count} businesses`);

    // Delete users (this should be last)
    const usersDeleted = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${usersDeleted.count} users`);

    console.log('🎉 Database cleared successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`- Users: ${usersDeleted.count}`);
    console.log(`- Customers: ${customersDeleted.count}`);
    console.log(`- Businesses: ${businessesDeleted.count}`);
    console.log(`- Offers: ${offersDeleted.count}`);
    console.log(`- Transactions: ${transactionsDeleted.count}`);
    console.log(`- Mukando Groups: ${groupsDeleted.count}`);
    console.log(`- Mukando Members: ${membersDeleted.count}`);
    console.log(`- Mukando Contributions: ${contributionsDeleted.count}`);
    console.log(`- Redeemed Offers: ${redeemedOffersDeleted.count}`);
    console.log(`- Redemption Codes: ${redemptionCodesDeleted.count}`);
    console.log(`- AI Insights: ${aiInsightsDeleted.count}`);

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
