const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importData() {
  try {
    console.log('📥 Reading local database export...');
    const data = JSON.parse(fs.readFileSync('local-database-export.json', 'utf8'));
    
    console.log('🧹 Clearing existing data...');
    // Clear in reverse dependency order
    await prisma.mukandoContribution.deleteMany();
    await prisma.mukandoMember.deleteMany();
    await prisma.mukandoGroup.deleteMany();
    await prisma.customerBadge.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.redeemedOffer.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.loyaltyRule.deleteMany();
    await prisma.customerBusinessRelation.deleteMany();
    await prisma.business.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('👥 Importing Users...');
    if (data.users && data.users.length > 0) {
      await prisma.user.createMany({ data: data.users });
      console.log(`✅ Imported ${data.users.length} users`);
    }
    
    console.log('🛡️ Importing Badges...');
    if (data.badges && data.badges.length > 0) {
      await prisma.badge.createMany({ data: data.badges });
      console.log(`✅ Imported ${data.badges.length} badges`);
    }
    
    console.log('👤 Importing Customers...');
    if (data.customers && data.customers.length > 0) {
      await prisma.customer.createMany({ data: data.customers });
      console.log(`✅ Imported ${data.customers.length} customers`);
    }
    
    console.log('🏢 Importing Businesses...');
    if (data.businesses && data.businesses.length > 0) {
      await prisma.business.createMany({ data: data.businesses });
      console.log(`✅ Imported ${data.businesses.length} businesses`);
    }
    
    console.log('🤝 Importing Customer-Business Relations...');
    if (data.customerBusinessRelations && data.customerBusinessRelations.length > 0) {
      await prisma.customerBusinessRelation.createMany({ data: data.customerBusinessRelations });
      console.log(`✅ Imported ${data.customerBusinessRelations.length} relations`);
    }
    
    console.log('📋 Importing Loyalty Rules...');
    if (data.loyaltyRules && data.loyaltyRules.length > 0) {
      await prisma.loyaltyRule.createMany({ data: data.loyaltyRules });
      console.log(`✅ Imported ${data.loyaltyRules.length} loyalty rules`);
    }
    
    console.log('🎁 Importing Offers...');
    if (data.offers && data.offers.length > 0) {
      await prisma.offer.createMany({ data: data.offers });
      console.log(`✅ Imported ${data.offers.length} offers`);
    }
    
    console.log('💰 Importing Transactions...');
    if (data.transactions && data.transactions.length > 0) {
      await prisma.transaction.createMany({ data: data.transactions });
      console.log(`✅ Imported ${data.transactions.length} transactions`);
    }
    
    console.log('🏆 Importing Customer Badges...');
    if (data.customerBadges && data.customerBadges.length > 0) {
      await prisma.customerBadge.createMany({ data: data.customerBadges });
      console.log(`✅ Imported ${data.customerBadges.length} customer badges`);
    }
    
    console.log('💼 Importing Mukando Groups...');
    if (data.mukandoGroups && data.mukandoGroups.length > 0) {
      await prisma.mukandoGroup.createMany({ data: data.mukandoGroups });
      console.log(`✅ Imported ${data.mukandoGroups.length} mukando groups`);
    }
    
    console.log('👥 Importing Mukando Members...');
    if (data.mukandoMembers && data.mukandoMembers.length > 0) {
      await prisma.mukandoMember.createMany({ data: data.mukandoMembers });
      console.log(`✅ Imported ${data.mukandoMembers.length} mukando members`);
    }
    
    console.log('💳 Importing Mukando Contributions...');
    if (data.mukandoContributions && data.mukandoContributions.length > 0) {
      await prisma.mukandoContribution.createMany({ data: data.mukandoContributions });
      console.log(`✅ Imported ${data.mukandoContributions.length} mukando contributions`);
    }
    
    console.log('🎉 Data import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
