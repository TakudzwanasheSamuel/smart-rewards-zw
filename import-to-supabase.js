const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Use Supabase connection - try direct connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:takudzwa@db.azpirsntvzzkupbopuqq.supabase.co:5432/postgres'
    }
  }
});

async function importData() {
  try {
    console.log('🔄 Reading exported data...');
    const data = JSON.parse(fs.readFileSync('local-database-export.json', 'utf8'));
    
    console.log('🔄 Starting import to Supabase...');

    // Import in correct order (dependencies first)
    
    // 1. Users first
    if (data.users?.length > 0) {
      console.log(`📥 Importing ${data.users.length} users...`);
      for (const user of data.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
      }
      console.log('✅ Users imported');
    }

    // 2. Customers
    if (data.customers?.length > 0) {
      console.log(`📥 Importing ${data.customers.length} customers...`);
      for (const customer of data.customers) {
        await prisma.customer.upsert({
          where: { user_id: customer.user_id },
          update: customer,
          create: customer
        });
      }
      console.log('✅ Customers imported');
    }

    // 3. Businesses
    if (data.businesses?.length > 0) {
      console.log(`📥 Importing ${data.businesses.length} businesses...`);
      for (const business of data.businesses) {
        await prisma.business.upsert({
          where: { user_id: business.user_id },
          update: business,
          create: business
        });
      }
      console.log('✅ Businesses imported');
    }

    // 4. Customer-Business Relations
    if (data.relations?.length > 0) {
      console.log(`📥 Importing ${data.relations.length} customer-business relations...`);
      for (const relation of data.relations) {
        await prisma.customerBusinessRelation.upsert({
          where: { 
            customer_id_business_id: {
              customer_id: relation.customer_id,
              business_id: relation.business_id
            }
          },
          update: relation,
          create: relation
        });
      }
      console.log('✅ Relations imported');
    }

    // 5. Badges
    if (data.badges?.length > 0) {
      console.log(`📥 Importing ${data.badges.length} badges...`);
      for (const badge of data.badges) {
        await prisma.badge.upsert({
          where: { id: badge.id },
          update: badge,
          create: badge
        });
      }
      console.log('✅ Badges imported');
    }

    // 6. Customer Badges
    if (data.customerBadges?.length > 0) {
      console.log(`📥 Importing ${data.customerBadges.length} customer badges...`);
      for (const customerBadge of data.customerBadges) {
        await prisma.customerBadge.upsert({
          where: { id: customerBadge.id },
          update: customerBadge,
          create: customerBadge
        });
      }
      console.log('✅ Customer badges imported');
    }

    // 7. Mukando Groups
    if (data.mukandoGroups?.length > 0) {
      console.log(`📥 Importing ${data.mukandoGroups.length} mukando groups...`);
      for (const group of data.mukandoGroups) {
        await prisma.mukandoGroup.upsert({
          where: { id: group.id },
          update: group,
          create: group
        });
      }
      console.log('✅ Mukando groups imported');
    }

    // 8. Mukando Members
    if (data.mukandoMembers?.length > 0) {
      console.log(`📥 Importing ${data.mukandoMembers.length} mukando members...`);
      for (const member of data.mukandoMembers) {
        await prisma.mukandoMember.upsert({
          where: { id: member.id },
          update: member,
          create: member
        });
      }
      console.log('✅ Mukando members imported');
    }

    // 9. Points Rules
    if (data.pointsRules?.length > 0) {
      console.log(`📥 Importing ${data.pointsRules.length} points rules...`);
      for (const rule of data.pointsRules) {
        await prisma.pointsRule.upsert({
          where: { id: rule.id },
          update: rule,
          create: rule
        });
      }
      console.log('✅ Points rules imported');
    }

    // 10. Loyalty Tiers
    if (data.loyaltyTiers?.length > 0) {
      console.log(`📥 Importing ${data.loyaltyTiers.length} loyalty tiers...`);
      for (const tier of data.loyaltyTiers) {
        await prisma.loyaltyTier.upsert({
          where: { id: tier.id },
          update: tier,
          create: tier
        });
      }
      console.log('✅ Loyalty tiers imported');
    }

    // 11. Offers
    if (data.offers?.length > 0) {
      console.log(`📥 Importing ${data.offers.length} offers...`);
      for (const offer of data.offers) {
        await prisma.offer.upsert({
          where: { id: offer.id },
          update: offer,
          create: offer
        });
      }
      console.log('✅ Offers imported');
    }

    // 12. Transactions (last because they reference everything)
    if (data.transactions?.length > 0) {
      console.log(`📥 Importing ${data.transactions.length} transactions...`);
      let imported = 0;
      for (const transaction of data.transactions) {
        try {
          await prisma.transaction.upsert({
            where: { id: transaction.id },
            update: transaction,
            create: transaction
          });
          imported++;
          if (imported % 1000 === 0) {
            console.log(`   Progress: ${imported}/${data.transactions.length} transactions`);
          }
        } catch (error) {
          console.log(`   Skipped transaction ${transaction.id}: ${error.message}`);
        }
      }
      console.log(`✅ ${imported} transactions imported`);
    }

    console.log('🎉 Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
