-- Smart Rewards ZW Database Setup Script
-- Run this script to set up the database after creating it

-- Enable PostGIS extension for geospatial features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum types
CREATE TYPE user_type AS ENUM ('customer', 'business');
CREATE TYPE rule_type AS ENUM ('points', 'tier', 'milestone', 'mukando', 'eco');
CREATE TYPE insight_type AS ENUM ('churn_prediction', 'segmentation', 'feedback_summary');

-- Note: The tables will be created by Prisma migrations
-- This script just sets up the extensions and types that Prisma needs

-- Create some sample data (optional)
-- You can uncomment and modify these if you want sample data

/*
-- Sample business categories
INSERT INTO "Business" (user_id, business_name, business_category, location) 
VALUES 
  ('business-1', 'Sample Restaurant', 'food', ST_GeomFromText('POINT(31.0335 -17.8252)', 4326)),
  ('business-2', 'Sample Retail Store', 'retail', ST_GeomFromText('POINT(31.0489 -17.829)', 4326));

-- Sample loyalty rules
INSERT INTO "LoyaltyRule" (business_id, rule_type, rule_json)
VALUES
  ('business-1', 'points', '{"amount": 1, "points": 1, "description": "1 point per $1 spent"}'),
  ('business-2', 'points', '{"amount": 2, "points": 1, "description": "1 point per $2 spent"}');
*/

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_location ON "Business" USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_business_category ON "Business" (business_category);
CREATE INDEX IF NOT EXISTS idx_customer_points ON "Customer" (loyalty_points);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON "Transaction" (created_at);
CREATE INDEX IF NOT EXISTS idx_offers_active ON "Offer" (active_from, active_to);
