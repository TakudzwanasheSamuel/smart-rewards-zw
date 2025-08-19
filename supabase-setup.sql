-- Smart Rewards Database Setup for Supabase
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (core authentication)
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'business', 'admin')),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
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

-- Businesses table
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

-- Customer-Business Relations (follows)
CREATE TABLE "CustomerBusinessRelation" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES "Customer"(user_id) ON DELETE CASCADE,
    business_id TEXT NOT NULL REFERENCES "Business"(user_id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, business_id)
);

-- Points Rules
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

-- Loyalty Tiers
CREATE TABLE "LoyaltyTier" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    business_id TEXT NOT NULL REFERENCES "Business"(user_id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    min_points INTEGER NOT NULL,
    benefits TEXT,
    multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Offers
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

-- Transactions
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

-- Badges
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

-- Customer Badges
CREATE TABLE "CustomerBadge" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES "Customer"(user_id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES "Badge"(id) ON DELETE CASCADE,
    earned_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, badge_id)
);

-- Mukando Groups
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

-- Mukando Members
CREATE TABLE "MukandoMember" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    group_id TEXT NOT NULL REFERENCES "MukandoGroup"(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL REFERENCES "Customer"(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_contributed INTEGER NOT NULL DEFAULT 0,
    rewards_received INTEGER NOT NULL DEFAULT 0,
    UNIQUE(group_id, customer_id)
);

-- Mukando Contributions
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
