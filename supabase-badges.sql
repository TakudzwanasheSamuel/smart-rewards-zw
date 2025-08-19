-- Insert initial badge data into Supabase
-- Run this after the main setup script

INSERT INTO "Badge" (name, description, icon, category, criteria_json, points_reward, is_active) VALUES
('First Steps', 'Welcome to Smart Rewards! You''ve taken your first step into a world of exciting rewards.', 'Trophy', 'milestone', '{"type": "signup"}', 50, true),
('Early Bird', 'One of the first 100 users to join Smart Rewards. You''re ahead of the curve!', 'Award', 'special', '{"type": "early_user", "user_number": 100}', 100, true),
('Point Collector', 'Earned your first 100 points. The journey of a thousand miles begins with a single step!', 'Star', 'milestone', '{"type": "points_milestone", "points": 100}', 25, true),
('Century Club', 'Impressive! You''ve accumulated 500 points. You''re really getting the hang of this!', 'Medal', 'milestone', '{"type": "points_milestone", "points": 500}', 50, true),
('Point Master', 'Wow! 1000 points earned. You''re a true points collecting master!', 'Crown', 'milestone', '{"type": "points_milestone", "points": 1000}', 100, true),
('Social Butterfly', 'You''ve followed 5 businesses. Building connections is key to maximizing rewards!', 'Users', 'social', '{"type": "follows", "count": 5}', 30, true),
('Network Builder', 'Following 10 businesses shows you''re serious about building your reward network!', 'UserPlus', 'social', '{"type": "follows", "count": 10}', 50, true),
('Community Champion', 'Amazing! You''re following 20+ businesses. You''re a true community champion!', 'Heart', 'social', '{"type": "follows", "count": 20}', 100, true),
('Shopping Spree', 'You''ve made 10 transactions. Shopping has never been more rewarding!', 'ShoppingBag', 'activity', '{"type": "transactions", "count": 10}', 40, true),
('Frequent Shopper', 'With 25 transactions, you''re becoming a frequent shopper extraordinaire!', 'ShoppingCart', 'activity', '{"type": "transactions", "count": 25}', 75, true),
('Transaction Titan', 'Incredible! 50+ transactions completed. You''re a true transaction titan!', 'Zap', 'activity', '{"type": "transactions", "count": 50}', 150, true),
('Mukando Pioneer', 'You''ve joined your first Mukando group. Welcome to collaborative savings!', 'Target', 'social', '{"type": "mukando_groups", "count": 1}', 60, true),
('Savings Enthusiast', 'Participating in 3 Mukando groups shows real commitment to smart saving!', 'PiggyBank', 'social', '{"type": "mukando_groups", "count": 3}', 100, true),
('Silver Achiever', 'You''ve reached Silver tier! Your loyalty is paying off beautifully.', 'Award', 'milestone', '{"type": "tier", "tier": "Silver"}', 75, true),
('Golden Member', 'Gold tier achieved! You''re among the elite members of Smart Rewards.', 'Trophy', 'milestone', '{"type": "tier", "tier": "Gold"}', 150, true),
('Platinum Elite', 'Platinum tier! You''ve reached the pinnacle of Smart Rewards membership.', 'Crown', 'milestone', '{"type": "tier", "tier": "Platinum"}', 300, true),
('Streak Starter', 'You''ve maintained a 7-day activity streak. Consistency is key!', 'Calendar', 'activity', '{"type": "streak", "days": 7}', 35, true),
('Streak Master', 'Incredible! 30 consecutive days of activity. You''re unstoppable!', 'Flame', 'activity', '{"type": "streak", "days": 30}', 120, true),
('Anniversary Special', 'Celebrating 1 year with Smart Rewards! Thank you for your continued loyalty.', 'Gift', 'special', '{"type": "anniversary", "years": 1}', 500, true);
