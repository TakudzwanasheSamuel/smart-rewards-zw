const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🔄 Exporting local database data...');

    // Export all data with error handling
    const users = await prisma.user.findMany().catch(e => { console.log('No users table'); return []; });
    const customers = await prisma.customer.findMany().catch(e => { console.log('No customers table'); return []; });
    const businesses = await prisma.business.findMany().catch(e => { console.log('No businesses table'); return []; });
    const relations = await prisma.customerBusinessRelation.findMany().catch(e => { console.log('No relations table'); return []; });
    const transactions = await prisma.transaction.findMany().catch(e => { console.log('No transactions table'); return []; });
    const badges = await prisma.badge?.findMany().catch(e => { console.log('No badges table'); return []; }) || [];
    const customerBadges = await prisma.customerBadge?.findMany().catch(e => { console.log('No customerBadges table'); return []; }) || [];
    const mukandoGroups = await prisma.mukandoGroup?.findMany().catch(e => { console.log('No mukandoGroups table'); return []; }) || [];
    const mukandoMembers = await prisma.mukandoMember?.findMany().catch(e => { console.log('No mukandoMembers table'); return []; }) || [];
    const pointsRules = await prisma.pointsRule?.findMany().catch(e => { console.log('No pointsRules table'); return []; }) || [];
    const loyaltyTiers = await prisma.loyaltyTier?.findMany().catch(e => { console.log('No loyaltyTiers table'); return []; }) || [];
    const offers = await prisma.offer?.findMany().catch(e => { console.log('No offers table'); return []; }) || [];

    const exportData = {
      users,
      customers,
      businesses,
      relations,
      transactions,
      badges,
      customerBadges,
      mukandoGroups,
      mukandoMembers,
      pointsRules,
      loyaltyTiers,
      offers,
      exportedAt: new Date().toISOString()
    };

    // Write to JSON file
    fs.writeFileSync('local-database-export.json', JSON.stringify(exportData, null, 2));
    
    console.log('✅ Data exported successfully to local-database-export.json');
    console.log(`📊 Exported:
- ${users.length} users
- ${customers.length} customers  
- ${businesses.length} businesses
- ${transactions.length} transactions
- ${badges.length} badges
- ${mukandoGroups.length} mukando groups`);

  } catch (error) {
    console.error('❌ Export error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
