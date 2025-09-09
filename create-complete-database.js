const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function createCompleteDatabaseScript() {
  try {
    console.log('🔄 Reading exported data...');
    const data = JSON.parse(fs.readFileSync('local-database-export.json', 'utf8'));
    
    console.log('🔄 Creating complete database recreation script...');

    // Start building the SQL script
    let sql = `-- Smart Rewards Complete Database Recreation Script
-- Generated on ${new Date().toISOString()}
-- This script will recreate the entire database with all data

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS "MukandoContribution" CASCADE;
DROP TABLE IF EXISTS "MukandoMember" CASCADE;
DROP TABLE IF EXISTS "MukandoGroup" CASCADE;
DROP TABLE IF EXISTS "CustomerBadge" CASCADE;
DROP TABLE IF EXISTS "Badge" CASCADE;
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "Offer" CASCADE;
DROP TABLE IF EXISTS "LoyaltyTier" CASCADE;
DROP TABLE IF EXISTS "PointsRule" CASCADE;
DROP TABLE IF EXISTS "CustomerBusinessRelation" CASCADE;
DROP TABLE IF EXISTS "Business" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables with schema
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'business', 'admin')),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Customer" (
    user_id TEXT PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    date_of_birth DATE,
    tier TEXT NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    total_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Business" (
    user_id TEXT PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_category TEXT NOT NULL,
    description TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    logo_url TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CustomerBusinessRelation" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES "Customer"(user_id) ON DELETE CASCADE,
    business_id TEXT NOT NULL REFERENCES "Business"(user_id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, business_id)
);

CREATE TABLE "PointsRule" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    business_id TEXT NOT NULL REFERENCES "Business"(user_id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    points_per_dollar INTEGER NOT NULL DEFAULT 1,
    min_purchase_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_points_per_transaction INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "LoyaltyTier" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    business_id TEXT NOT NULL REFERENCES "Business"(user_id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    min_points INTEGER NOT NULL,
    benefits TEXT,
    multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Offer" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    business_id TEXT NOT NULL REFERENCES "Business"(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    points_required INTEGER NOT NULL,
    discount_percentage DOUBLE PRECISION,
    discount_amount DOUBLE PRECISION,
    max_redemptions INTEGER,
    current_redemptions INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP(3),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Transaction" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES "Customer"(user_id) ON DELETE CASCADE,
    business_id TEXT NOT NULL REFERENCES "Business"(user_id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'adjustment', 'mukando_contribution', 'mukando_reward')),
    amount DOUBLE PRECISION NOT NULL,
    points_earned INTEGER,
    points_redeemed INTEGER,
    description TEXT,
    mukando_group_id TEXT,
    is_mukando_contribution BOOLEAN NOT NULL DEFAULT false,
    loyalty_points_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Badge" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('activity', 'social', 'milestone', 'special')),
    criteria_json JSONB NOT NULL,
    points_reward INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CustomerBadge" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES "Customer"(user_id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES "Badge"(id) ON DELETE CASCADE,
    earned_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, badge_id)
);

CREATE TABLE "MukandoGroup" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    creator_id TEXT NOT NULL REFERENCES "Customer"(user_id) ON DELETE CASCADE,
    business_id TEXT NOT NULL REFERENCES "Business"(user_id) ON DELETE CASCADE,
    goal_name TEXT NOT NULL,
    goal_points_required INTEGER NOT NULL,
    contribution_interval TEXT NOT NULL CHECK (contribution_interval IN ('weekly', 'monthly')),
    term_length INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'completed', 'cancelled')),
    max_members INTEGER,
    discount_rate DOUBLE PRECISION,
    total_mukando_points INTEGER NOT NULL DEFAULT 0,
    total_loyalty_points_earned INTEGER NOT NULL DEFAULT 0,
    current_payout_turn INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP(3),
    completed_at TIMESTAMP(3)
);

CREATE TABLE "MukandoMember" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    group_id TEXT NOT NULL REFERENCES "MukandoGroup"(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL REFERENCES "Customer"(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_contributed INTEGER NOT NULL DEFAULT 0,
    rewards_received INTEGER NOT NULL DEFAULT 0,
    UNIQUE(group_id, customer_id)
);

CREATE TABLE "MukandoContribution" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    group_id TEXT NOT NULL REFERENCES "MukandoGroup"(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES "MukandoMember"(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    contribution_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cycle_number INTEGER NOT NULL,
    loyalty_points_earned INTEGER NOT NULL DEFAULT 0
);

-- Add indexes for better performance
CREATE INDEX idx_customer_business_relation_customer ON "CustomerBusinessRelation"(customer_id);
CREATE INDEX idx_customer_business_relation_business ON "CustomerBusinessRelation"(business_id);
CREATE INDEX idx_transaction_customer ON "Transaction"(customer_id);
CREATE INDEX idx_transaction_business ON "Transaction"(business_id);
CREATE INDEX idx_transaction_created_at ON "Transaction"(created_at);
CREATE INDEX idx_mukando_group_business ON "MukandoGroup"(business_id);
CREATE INDEX idx_mukando_group_creator ON "MukandoGroup"(creator_id);
CREATE INDEX idx_mukando_member_group ON "MukandoMember"(group_id);
CREATE INDEX idx_mukando_member_customer ON "MukandoMember"(customer_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON "Customer" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_updated_at BEFORE UPDATE ON "Business" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mukando_group_updated_at BEFORE UPDATE ON "MukandoGroup" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert all the data
`;

    // Helper function to escape SQL values
    function sqlValue(value) {
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`;
      }
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (value instanceof Date) return `'${value.toISOString()}'`;
      if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
      return value;
    }

    // Insert users
    if (data.users?.length > 0) {
      sql += `\n-- Insert Users (${data.users.length} records)\n`;
      for (const user of data.users) {
        sql += `INSERT INTO "User" (id, email, password_hash, user_type, created_at, updated_at) VALUES (${sqlValue(user.id)}, ${sqlValue(user.email)}, ${sqlValue(user.password_hash)}, ${sqlValue(user.user_type)}, ${sqlValue(user.created_at)}, ${sqlValue(user.updated_at)});\n`;
      }
    }

    // Insert customers
    if (data.customers?.length > 0) {
      sql += `\n-- Insert Customers (${data.customers.length} records)\n`;
      for (const customer of data.customers) {
        sql += `INSERT INTO "Customer" (user_id, full_name, phone_number, date_of_birth, tier, total_points, created_at, updated_at) VALUES (${sqlValue(customer.user_id)}, ${sqlValue(customer.full_name)}, ${sqlValue(customer.phone_number)}, ${sqlValue(customer.date_of_birth)}, ${sqlValue(customer.tier)}, ${sqlValue(customer.total_points)}, ${sqlValue(customer.created_at)}, ${sqlValue(customer.updated_at)});\n`;
      }
    }

    // Insert businesses
    if (data.businesses?.length > 0) {
      sql += `\n-- Insert Businesses (${data.businesses.length} records)\n`;
      for (const business of data.businesses) {
        sql += `INSERT INTO "Business" (user_id, business_name, business_category, description, address, latitude, longitude, logo_url, created_at, updated_at) VALUES (${sqlValue(business.user_id)}, ${sqlValue(business.business_name)}, ${sqlValue(business.business_category)}, ${sqlValue(business.description)}, ${sqlValue(business.address)}, ${sqlValue(business.latitude)}, ${sqlValue(business.longitude)}, ${sqlValue(business.logo_url)}, ${sqlValue(business.created_at)}, ${sqlValue(business.updated_at)});\n`;
      }
    }

    // Insert customer-business relations
    if (data.relations?.length > 0) {
      sql += `\n-- Insert Customer-Business Relations (${data.relations.length} records)\n`;
      for (const relation of data.relations) {
        sql += `INSERT INTO "CustomerBusinessRelation" (id, customer_id, business_id, total_points, created_at) VALUES (${sqlValue(relation.id)}, ${sqlValue(relation.customer_id)}, ${sqlValue(relation.business_id)}, ${sqlValue(relation.total_points)}, ${sqlValue(relation.created_at)});\n`;
      }
    }

    // Insert badges
    if (data.badges?.length > 0) {
      sql += `\n-- Insert Badges (${data.badges.length} records)\n`;
      for (const badge of data.badges) {
        sql += `INSERT INTO "Badge" (id, name, description, icon, category, criteria_json, points_reward, is_active, created_at) VALUES (${sqlValue(badge.id)}, ${sqlValue(badge.name)}, ${sqlValue(badge.description)}, ${sqlValue(badge.icon)}, ${sqlValue(badge.category)}, ${sqlValue(badge.criteria_json)}, ${sqlValue(badge.points_reward)}, ${sqlValue(badge.is_active)}, ${sqlValue(badge.created_at)});\n`;
      }
    }

    // Insert customer badges
    if (data.customerBadges?.length > 0) {
      sql += `\n-- Insert Customer Badges (${data.customerBadges.length} records)\n`;
      for (const customerBadge of data.customerBadges) {
        sql += `INSERT INTO "CustomerBadge" (id, customer_id, badge_id, earned_at) VALUES (${sqlValue(customerBadge.id)}, ${sqlValue(customerBadge.customer_id)}, ${sqlValue(customerBadge.badge_id)}, ${sqlValue(customerBadge.earned_at)});\n`;
      }
    }

    // Insert mukando groups
    if (data.mukandoGroups?.length > 0) {
      sql += `\n-- Insert Mukando Groups (${data.mukandoGroups.length} records)\n`;
      for (const group of data.mukandoGroups) {
        sql += `INSERT INTO "MukandoGroup" (id, creator_id, business_id, goal_name, goal_points_required, contribution_interval, term_length, status, max_members, discount_rate, total_mukando_points, total_loyalty_points_earned, current_payout_turn, created_at, updated_at, approved_at, completed_at) VALUES (${sqlValue(group.id)}, ${sqlValue(group.creator_id)}, ${sqlValue(group.business_id)}, ${sqlValue(group.goal_name)}, ${sqlValue(group.goal_points_required)}, ${sqlValue(group.contribution_interval)}, ${sqlValue(group.term_length)}, ${sqlValue(group.status)}, ${sqlValue(group.max_members)}, ${sqlValue(group.discount_rate)}, ${sqlValue(group.total_mukando_points)}, ${sqlValue(group.total_loyalty_points_earned)}, ${sqlValue(group.current_payout_turn)}, ${sqlValue(group.created_at)}, ${sqlValue(group.updated_at)}, ${sqlValue(group.approved_at)}, ${sqlValue(group.completed_at)});\n`;
      }
    }

    // Insert mukando members
    if (data.mukandoMembers?.length > 0) {
      sql += `\n-- Insert Mukando Members (${data.mukandoMembers.length} records)\n`;
      for (const member of data.mukandoMembers) {
        sql += `INSERT INTO "MukandoMember" (id, group_id, customer_id, joined_at, total_contributed, rewards_received) VALUES (${sqlValue(member.id)}, ${sqlValue(member.group_id)}, ${sqlValue(member.customer_id)}, ${sqlValue(member.joined_at)}, ${sqlValue(member.total_contributed)}, ${sqlValue(member.rewards_received)});\n`;
      }
    }

    // Insert points rules
    if (data.pointsRules?.length > 0) {
      sql += `\n-- Insert Points Rules (${data.pointsRules.length} records)\n`;
      for (const rule of data.pointsRules) {
        sql += `INSERT INTO "PointsRule" (id, business_id, rule_name, points_per_dollar, min_purchase_amount, max_points_per_transaction, is_active, created_at) VALUES (${sqlValue(rule.id)}, ${sqlValue(rule.business_id)}, ${sqlValue(rule.rule_name)}, ${sqlValue(rule.points_per_dollar)}, ${sqlValue(rule.min_purchase_amount)}, ${sqlValue(rule.max_points_per_transaction)}, ${sqlValue(rule.is_active)}, ${sqlValue(rule.created_at)});\n`;
      }
    }

    // Insert loyalty tiers
    if (data.loyaltyTiers?.length > 0) {
      sql += `\n-- Insert Loyalty Tiers (${data.loyaltyTiers.length} records)\n`;
      for (const tier of data.loyaltyTiers) {
        sql += `INSERT INTO "LoyaltyTier" (id, business_id, tier_name, min_points, benefits, multiplier, created_at) VALUES (${sqlValue(tier.id)}, ${sqlValue(tier.business_id)}, ${sqlValue(tier.tier_name)}, ${sqlValue(tier.min_points)}, ${sqlValue(tier.benefits)}, ${sqlValue(tier.multiplier)}, ${sqlValue(tier.created_at)});\n`;
      }
    }

    // Insert offers
    if (data.offers?.length > 0) {
      sql += `\n-- Insert Offers (${data.offers.length} records)\n`;
      for (const offer of data.offers) {
        sql += `INSERT INTO "Offer" (id, business_id, title, description, points_required, discount_percentage, discount_amount, max_redemptions, current_redemptions, valid_from, valid_until, is_active, created_at) VALUES (${sqlValue(offer.id)}, ${sqlValue(offer.business_id)}, ${sqlValue(offer.title)}, ${sqlValue(offer.description)}, ${sqlValue(offer.points_required)}, ${sqlValue(offer.discount_percentage)}, ${sqlValue(offer.discount_amount)}, ${sqlValue(offer.max_redemptions)}, ${sqlValue(offer.current_redemptions)}, ${sqlValue(offer.valid_from)}, ${sqlValue(offer.valid_until)}, ${sqlValue(offer.is_active)}, ${sqlValue(offer.created_at)});\n`;
      }
    }

    // Insert transactions (in batches for performance)
    if (data.transactions?.length > 0) {
      sql += `\n-- Insert Transactions (${data.transactions.length} records)\n`;
      for (const transaction of data.transactions) {
        sql += `INSERT INTO "Transaction" (id, customer_id, business_id, transaction_type, amount, points_earned, points_redeemed, description, mukando_group_id, is_mukando_contribution, loyalty_points_awarded, created_at) VALUES (${sqlValue(transaction.id)}, ${sqlValue(transaction.customer_id)}, ${sqlValue(transaction.business_id)}, ${sqlValue(transaction.transaction_type)}, ${sqlValue(transaction.amount)}, ${sqlValue(transaction.points_earned)}, ${sqlValue(transaction.points_redeemed)}, ${sqlValue(transaction.description)}, ${sqlValue(transaction.mukando_group_id)}, ${sqlValue(transaction.is_mukando_contribution)}, ${sqlValue(transaction.loyalty_points_awarded)}, ${sqlValue(transaction.created_at)});\n`;
      }
    }

    sql += `\n-- Database recreation completed successfully!\n-- Total records imported:\n`;
    sql += `-- Users: ${data.users?.length || 0}\n`;
    sql += `-- Customers: ${data.customers?.length || 0}\n`;
    sql += `-- Businesses: ${data.businesses?.length || 0}\n`;
    sql += `-- Transactions: ${data.transactions?.length || 0}\n`;
    sql += `-- Badges: ${data.badges?.length || 0}\n`;
    sql += `-- Mukando Groups: ${data.mukandoGroups?.length || 0}\n`;

    // Write the complete SQL file
    fs.writeFileSync('complete-database-recreation.sql', sql);
    
    console.log('✅ Complete database recreation script created!');
    console.log('📂 File: complete-database-recreation.sql');
    console.log(`📊 Script will recreate database with:
- ${data.users?.length || 0} users
- ${data.customers?.length || 0} customers  
- ${data.businesses?.length || 0} businesses
- ${data.transactions?.length || 0} transactions
- ${data.badges?.length || 0} badges
- ${data.mukandoGroups?.length || 0} mukando groups`);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Copy and paste the complete-database-recreation.sql content');
    console.log('3. Run the script to recreate everything at once');
    
  } catch (error) {
    console.error('❌ Error creating script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCompleteDatabaseScript();
