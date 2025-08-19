# Smart Rewards ZW - Local Testing Guide

## Prerequisites

Before testing, ensure you have completed the backend setup from `BACKEND_SETUP.md`:

1. ✅ PostgreSQL with PostGIS running
2. ✅ Database created and configured
3. ✅ Environment variables set in `.env`
4. ✅ Dependencies installed (`npm install`)
5. ✅ Prisma client generated (`npx prisma generate`)
6. ✅ Database schema deployed (`npx prisma db push`)

## Starting the Application

### 1. Start the Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:9002`

### 2. Start AI Development (Optional)

In a separate terminal:

```bash
npm run genkit:dev
```

Genkit UI will be available at: `http://localhost:4000`

## Testing Checklist

### 🔐 Authentication Flow

#### Customer Registration & Login
1. **Go to:** `http://localhost:9002/register`
2. **Select:** "I'm a Customer"
3. **Fill out:** Registration form with valid email/password
4. **Expected:** Account creation success, redirect to preferences
5. **Set preferences:** Select 2-3 interests, save
6. **Expected:** Redirect to customer dashboard
7. **Logout and login:** Use same credentials
8. **Expected:** Successful login, dashboard shows your data

#### Business Registration & Login
1. **Go to:** `http://localhost:9002/register`
2. **Select:** "I'm a Business"
3. **Fill out:** Business registration form
4. **Expected:** Account creation success, redirect to profile setup
5. **Login:** Use business credentials with "Sign In as Business"
6. **Expected:** Redirect to admin dashboard

### 📊 Customer Dashboard
1. **Login as customer**
2. **Verify:** Real profile data is displayed (name, points, tier)
3. **Check:** Points display correctly (0 initially for new account)
4. **Verify:** Tier shows "Bronze" and progress bar
5. **Test:** Navigation to wallet, businesses, etc.

### 🏢 Admin Dashboard  
1. **Login as business**
2. **Verify:** Admin interface loads
3. **Check:** AI insights component
4. **Test:** Quick action buttons work
5. **Navigate:** Customer management, rules, offers

### 🔧 Integration Testing Page
1. **Go to:** `http://localhost:9002/test-integration`
2. **Test:** Authentication status shows correctly
3. **Run:** Customer Profile API test (must be logged in)
4. **Run:** Business List API test
5. **Verify:** Results show success messages

### 📱 Core Features

#### Business Discovery
1. **Go to:** Customer → Businesses
2. **Verify:** Business list loads (may be empty initially)
3. **Test:** Search and filtering
4. **Test:** Business detail page

#### Map View
1. **Go to:** Customer → Map
2. **Verify:** Map loads with Harare, Zimbabwe location
3. **Check:** Map markers display
4. **Test:** Map interactions

#### QR Scanning
1. **Go to:** Customer → Scan & Earn
2. **Verify:** Camera permission request
3. **Test:** File upload option
4. **Check:** UI responds appropriately

#### Notifications
1. **Go to:** Customer → Notifications
2. **Verify:** Notification list displays
3. **Check:** Mock notifications show correctly

### 🎯 AI Features Testing

#### Personalized Offers
1. **Go to:** Customer Dashboard
2. **Scroll to:** "Personalized For You" section
3. **Wait:** For AI offer generation (1-2 seconds)
4. **Verify:** Offers carousel loads
5. **Check:** Offers are relevant to your preferences

#### AI Insights (Admin)
1. **Login as business**
2. **Go to:** Admin Dashboard
3. **Check:** AI Insights card on right side
4. **Test:** Churn and Feedback tabs
5. **Verify:** AI data loads correctly

## Database Testing

### Create Sample Data

You can manually add sample data via SQL or through the app:

```sql
-- Add a sample business with location
INSERT INTO "Business" (user_id, business_name, business_category, location) 
VALUES ('business-uuid', 'Test Restaurant', 'food', ST_GeomFromText('POINT(31.0335 -17.8252)', 4326));

-- Add loyalty points to a customer
UPDATE "Customer" SET loyalty_points = 1500, loyalty_tier = 'Silver' 
WHERE user_id = 'customer-uuid';
```

### API Testing

Use the integration test page or test APIs directly:

```bash
# Register a customer
curl -X POST http://localhost:9002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "user_type": "customer",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get customer profile (use token from login)
curl -X GET http://localhost:9002/api/customers/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Common Issues & Solutions

### Database Issues
- **Connection failed:** Check PostgreSQL is running, verify DATABASE_URL
- **PostGIS missing:** Install PostGIS extension: `CREATE EXTENSION postgis;`
- **Schema issues:** Reset with `npx prisma db push --force-reset`

### Authentication Issues
- **JWT errors:** Verify JWT_SECRET is set in .env
- **Login fails:** Check user exists in database, password hashing working
- **Token invalid:** Clear browser localStorage and re-login

### API Issues
- **CORS errors:** Ensure requests are to same origin (localhost:9002)
- **404 errors:** Verify API routes exist in `src/app/api/`
- **500 errors:** Check server logs for detailed error messages

### AI Features Issues
- **Offers not loading:** Verify GOOGLE_API_KEY is set
- **AI insights fail:** Check Genkit configuration and API quotas
- **Slow responses:** AI calls may take 1-3 seconds, this is normal

## Performance Testing

### Load Testing (Optional)
```bash
# Install artillery for load testing
npm install -g artillery

# Test authentication endpoint
artillery quick --count 10 --num 5 http://localhost:9002/api/auth/login
```

### Memory Usage
- Monitor browser dev tools → Performance
- Check for memory leaks during navigation
- Verify API responses are reasonable size

## Production Readiness Checklist

Before deployment:

1. ✅ All tests pass
2. ✅ Environment variables secured
3. ✅ Database migrations work
4. ✅ Error handling comprehensive
5. ✅ API rate limiting configured
6. ✅ HTTPS enabled
7. ✅ Database backups configured
8. ✅ Monitoring and logging set up

## Success Criteria

The application is working correctly if:

1. **✅ Users can register and login** (both customer and business)
2. **✅ Customer dashboard shows real data** from database
3. **✅ API integration test page passes** all tests
4. **✅ AI features load and display data** (may be simulated)
5. **✅ Navigation works** between all pages
6. **✅ No console errors** during normal usage
7. **✅ Mobile responsive** layout works on different screen sizes

## Support & Debugging

### Enable Debug Mode
Add to your `.env`:
```
NODE_ENV=development
DEBUG=true
```

### View Database Data
```bash
# Connect to database
psql -d smart_rewards_zw

# View users
SELECT * FROM "User";

# View customers with points
SELECT u.email, c.full_name, c.loyalty_points, c.loyalty_tier 
FROM "User" u 
JOIN "Customer" c ON u.id = c.user_id;
```

### Check Server Logs
- Browser dev tools → Console for frontend errors
- Terminal running `npm run dev` for backend errors
- Check Network tab for API request/response details

## Next Steps

After successful local testing:
1. Deploy to staging environment
2. Set up production database
3. Configure monitoring and analytics
4. Perform user acceptance testing
5. Launch! 🚀



chickeninn@flow.com: takudzwa
takudzwa@smart.com: takudzwa