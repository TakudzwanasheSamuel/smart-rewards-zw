# Smart Rewards ZW – The Unified Loyalty Ecosystem
> ### Tagline: One Platform. Every Business. Every Customer.

## Core Vision
Smart Rewards ZW is a multi-tenant, AI-powered, location-based loyalty ecosystem designed to empower all Zimbabwean businesses—from the corner barber to the national supermarket chain. By combining AI, location intelligence, offline-first technology, and Zimbabwe’s own Mukando/maRound traditions, we create a connected network where loyalty is personalized, community-driven, and even financially empowering. We go beyond simple points to boost retention, drive sales in slow periods, and deliver real social and economic impact.

---

## 1. Core Functional Modules

### Loyalty Engine
A flexible logic system to manage points, Eco-Points, service eligibility, and benefits based on tiers and milestones.

**Supported Models:**
- **Points:** Classic point-based systems.
- **Tiers & Milestones:** E.g., a "Gold Tier" for hardware store contractors or a "free haircut after 5 visits" milestone for a barbershop.
- **Mukando/maRound Groups:** The engine will manage the rotation of payouts, with bonus point allocation for payout recipients.

**Rules Based on Customer Actions:**
- Purchases, visits, check-ins, and referrals.
- Digital Engagement: Rewarding social media shares or app interactions.
- Sustainable Actions: Awarding Eco-Points for using reusable bags or digital receipts.
- **AI-Driven Behavior Analysis:** The AI dynamically adapts reward offers based on customer activity, purchase history, and Mukando/maRound participation to maximize engagement.

### Customer Wallet & Profile
- **Comprehensive Tracking:** Tracks standard points, service eligibility, and engagement history.
- **Loyalty Tier & Activity Logs:** Detailed logs of customer activities, tier progression, and location-based check-ins.
- **Financial Inclusion Tracking:** Logs Loyalty Bonds created and Mukando contributions.
- **AI-Powered Segmentation:** The AI segments customers for personalized experiences and delivers targeted, context-based offers via the platform.
- **Flexible Redemption:** Customers can redeem points directly via the mobile/web app, USSD, or WhatsApp chatbot.

### Admin Dashboard
- **Program Configuration:** Business owners can configure loyalty rules, set up Mukando groups, and define maRound cycles.
- **Performance Monitoring:** View customer activity, track Mukando/maRound progress, monitor redemption rates, and manage eligibility-based offers.
- **Manual Override Tools:** Provides tools for manually adjusting points, approving offers, and managing Mukando group memberships.
- **AI Insights & Prediction:** The dashboard provides AI-driven insights, churn prediction to trigger retention campaigns, and natural language summarization of customer feedback to guide decision-making.
- **Redemption Logic:** Admins can set rules for point redemption, including what offers are available and any time or tier restrictions.

### User Interface (Web or Mobile)
- **Intuitive Display:** A simple, clean interface to view points, Eco-Points, service eligibility, and available location-based offers.
- **Notifications:** Real-time push notifications for new benefits, tier upgrades, Mukando/maRound payouts, or expiring points.
- **Gamification:** Optional features like badges and progress bars to make earning rewards fun and engaging.
- **AI-Generated Recommendations:** The AI suggests personalized offers, Mukando groups to join, or products to save for based on user behavior.

---

## 2. Security Requirements
- **Authentication & Access Control:** Robust user authentication for both customers and merchants, with granular access control for the admin dashboard.
- **Data Encryption:** All sensitive data (customer profiles, transaction history, Mukando pot details) must be encrypted both in transit (using HTTPS/TLS) and at rest (using AES-256).
- **Fraud Prevention:** AI-powered fraud detection for point/service transactions, with secure logging and verification for all redemptions (including USSD and WhatsApp).
- **Secure APIs & Audit Logging:** All APIs must be secured with authentication tokens. A complete audit log of all transactions, point adjustments, and system changes will be maintained.
- **Controls for Transfers:** Secure controls for point transfers or Skill-Swap transactions to prevent unauthorized activity.

---

## 3. AI Integration Suggestions
- **Behavior Prediction:** Predict customer actions, such as their next visit to a barbershop, to trigger proactive engagement.
- **Churn Detection:** Identify customers who have skipped usual visits and trigger retention workflows with personalized win-back offers.
- **Smart Segmentation:** Create dynamic, targeted campaigns based on customer behavior, location, and Mukando group participation.
- **Natural Language Summarization:** Use NLP to summarize user feedback from chats and social media, giving merchants quick, actionable insights.
- **Location-Aware Intelligence:** Use geo-fencing and real-time location data to provide context-based offers (e.g., a "Rainy Day Special" on a cold, wet day).

---

## 4. Points Earning Logic
- **Customer Actions:** Points are earned through relevant customer actions, including purchases, store visits, referrals, and digital engagement.
- **Mukando Contributions:** A portion of each purchase is allocated to the Mukando pot, and bonus points are awarded for consistent contributions.
- **Location-Based Triggers:** Customers can earn points for store visits, event check-ins, or passing by a geo-fenced location.
- **Sustainability:** Eco-Points are earned for environmentally friendly actions.
- **Traceability Rewards:** Bonus points are earned for scanning a QR code on products to verify their origin.
- **Verification:** All point-earning actions will include secure verification and logging to prevent fraud and ensure data integrity.

---

## 5. Database Schema

This schema is designed for a full-stack Next.js application using PostgreSQL with the PostGIS extension for geospatial data.

### 5.1. User & Business Management

#### `users` table
- `id` (UUID, PRIMARY KEY): Unique identifier for a user (customer or business).
- `email` (VARCHAR(255), UNIQUE): User's email address.
- `password_hash` (VARCHAR(255)): Securely stored password hash.
- `user_type` (ENUM 'customer', 'business'): Differentiates between customers and business accounts.
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT now()): Timestamp of account creation.
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT now()): Timestamp of last update.

#### `customers` table
- `user_id` (UUID, PRIMARY KEY, FOREIGN KEY REFERENCES users(id)): Links to the core user account.
- `full_name` (VARCHAR(255)): Customer's full name.
- `interests` (TEXT[]): An array of strings for their interests (e.g., {'fast food', 'salons'}).
- `loyalty_points` (INTEGER, DEFAULT 0): The customer's current points balance.
- `eco_points` (INTEGER, DEFAULT 0): Points earned for sustainable actions.
- `loyalty_tier` (VARCHAR(50), DEFAULT 'Bronze'): Current loyalty tier.
- `referral_code` (VARCHAR(50), UNIQUE): Unique code for referrals.

#### `businesses` table
- `user_id` (UUID, PRIMARY KEY, FOREIGN KEY REFERENCES users(id)): Links to the core user account.
- `business_name` (VARCHAR(255)): Name of the business.
- `business_category` (VARCHAR(50)): Category of the business (e.g., 'Fast Food').
- `logo_url` (VARCHAR(255)): URL for the business logo.
- `contact_phone` (VARCHAR(50)): Business phone number.
- `location` (GEOMETRY(Point, 4326)): PostGIS column to store the business's location as a point.
- `shared_loyalty_id` (UUID, NULLABLE): An optional identifier to group businesses into a shared network.

#### `customer_business_relations` table
- `customer_id` (UUID, FOREIGN KEY REFERENCES customers(user_id)): The customer's ID.
- `business_id` (UUID, FOREIGN KEY REFERENCES businesses(user_id)): The business's ID.
- PRIMARY KEY (`customer_id`, `business_id`): Ensures a customer can only follow a business once.

### 5.2. Loyalty Engine & Transaction Logic

#### `transactions` table
- `id` (UUID, PRIMARY KEY): Unique identifier for a transaction.
- `customer_id` (UUID, FOREIGN KEY REFERENCES customers(user_id)): The customer who made the purchase.
- `business_id` (UUID, FOREIGN KEY REFERENCES businesses(user_id)): The business where the purchase was made.
- `transaction_amount` (DECIMAL(10, 2)): Total value of the transaction.
- `points_earned` (INTEGER): Points awarded for this transaction.
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT now()): Timestamp of the transaction.

#### `loyalty_rules` table
- `id` (UUID, PRIMARY KEY): Unique identifier for a loyalty rule.
- `business_id` (UUID, FOREIGN KEY REFERENCES businesses(user_id)): The business that owns this rule.
- `rule_type` (ENUM 'points', 'tier', 'milestone', 'mukando', 'eco'): The type of loyalty rule.
- `rule_json` (JSONB): A flexible JSON object to store the specific logic for each rule type (e.g., { "action": "purchase", "value": 1, "currency": "USD" }).

#### `offers` table
- `id` (UUID, PRIMARY KEY): Unique identifier for an offer.
- `business_id` (UUID, FOREIGN KEY REFERENCES businesses(user_id)): The business creating the offer.
- `offer_name` (VARCHAR(255)): Name of the offer (e.g., "Lunchtime Special").
- `description` (TEXT): Details about the offer.
- `points_required` (INTEGER): Points needed to redeem the offer.
- `is_geo_fenced` (BOOLEAN): Flag if the offer is location-based.
- `geo_fence` (GEOMETRY(Polygon, 4326)): PostGIS column to define the geofence area.
- `active_from` (TIMESTAMP WITH TIME ZONE): Start time of the offer.
- `active_to` (TIMESTAMP WITH TIME ZONE): End time of the offer.

### 5.3. Mukando & AI Integrations

#### `mukando_groups` table
- `id` (UUID, PRIMARY KEY): Unique identifier for a Mukando group.
- `business_id` (UUID, FOREIGN KEY REFERENCES businesses(user_id)): The business running the group.
- `group_name` (VARCHAR(255)): Name of the group.
- `current_payout_user_id` (UUID, FOREIGN KEY REFERENCES customers(user_id)): Who receives the payout next.
- `total_pot` (DECIMAL(10, 2)): The total value collected in the pot.

#### `mukando_contributions` table
- `id` (UUID, PRIMARY KEY): Unique identifier for a contribution.
- `group_id` (UUID, FOREIGN KEY REFERENCES mukando_groups(id)): The group this contribution belongs to.
- `customer_id` (UUID, FOREIGN KEY REFERENCES customers(user_id)): The customer who contributed.
- `amount` (DECIMAL(10, 2)): The amount contributed.
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT now()): Timestamp of the contribution.

#### `ai_insights` table
- `id` (UUID, PRIMARY KEY): Unique identifier for an insight.
- `business_id` (UUID, FOREIGN KEY REFERENCES businesses(user_id)): The business the insight is for.
- `insight_type` (ENUM 'churn_prediction', 'segmentation', 'feedback_summary'): The type of AI insight.
- `insight_json` (JSONB): A flexible JSON object to store the insight data (e.g., { "customer_id": "...", "risk_score": 0.85, "recommendation": "send win-back offer" }).
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT now()): Timestamp of the insight generation.

### 5.4. Security & Logging

#### `audit_logs` table
- `id` (UUID, PRIMARY KEY): Unique identifier for the log entry.
- `user_id` (UUID, FOREIGN KEY REFERENCES users(id)): The user who performed the action.
- `action` (TEXT): A description of the action (e.g., "Manual point adjustment").
- `details` (JSONB): A JSON object with relevant details (e.g., { "customer_id": "...", "old_points": 100, "new_points": 150 }).
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT now()): Timestamp of the action.
