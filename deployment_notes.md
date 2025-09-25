# Smart Rewards Deployment Notes

## 🚀 Deployment Information

**Deployment Date**: August 19, 2025  
**Deployment Target**: Digital Ocean Droplet  
**Application URL**: http://159.65.58.153:3000  
**Status**: ✅ Successfully Deployed and Running

---

## 🖥️ Server Details

### Digital Ocean Droplet Specifications
- **IP Address**: 159.65.58.153
- **Operating System**: Ubuntu 22.04 LTS
- **Memory**: 1GB RAM
- **Storage**: 25GB SSD
- **CPU**: 1 vCPU
- **Swap**: 2GB (added during deployment)

### Server Access
- **SSH Access**: `ssh root@159.65.58.153`
- **Password**: 

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Next.js 15.3.3 (Full-stack React framework)
- **Database**: PostgreSQL 15.7
- **ORM**: Prisma 6.14.0
- **Authentication**: JWT (JSON Web Tokens)
- **AI Framework**: Google Genkit
- **Process Manager**: PM2

### Frontend
- **Framework**: Next.js with React
- **Styling**: Tailwind CSS + Shadcn UI Components
- **Maps**: React-Leaflet for location features
- **File Uploads**: Multer for business logo uploads

### Infrastructure
- **Web Server**: Nginx (reverse proxy)
- **Node.js**: v20.x
- **Package Manager**: npm

---

## 📂 Application Structure

### Key Directories
```
/var/www/smart-rewards/
├── src/                    # Source code
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/              # Utility libraries
│   └── ai/               # AI flows and logic
├── prisma/               # Database schema
├── uploads/              # User uploaded files
├── .env                  # Environment variables
├── package.json          # Dependencies
└── ecosystem.config.js   # PM2 configuration
```

### Database Schema
- **Users**: 160 total (100 customers + 60 businesses)
- **Businesses**: Complete with profiles and location data
- **Transactions**: 12,028+ transaction records
- **Badges**: 19 different achievement badges
- **Mukando Groups**: Community savings groups
- **Offers**: 308+ business offers
- **Loyalty Rules**: Points and tier systems

---

## 🔧 Environment Configuration

### Environment Variables (.env)
```env
DATABASE_URL="postgresql://postgres:smartrewards2025@localhost:5432/smart_rewards"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://159.65.58.153"
GENKIT_ENV="prod"
```

### Database Configuration
- **Database Name**: smart_rewards
- **Username**: postgres
- **Password**: smartrewards2025
- **Port**: 5432 (default PostgreSQL)
- **Connection**: Local connection via localhost

---

## 🚀 Deployment Process

### 1. Server Setup
```bash
# System updates and dependencies
apt update && apt upgrade -y
apt install -y curl wget git nginx postgresql postgresql-contrib

# Node.js installation via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 process manager
npm install -g pm2
```

### 2. Database Setup
```bash
# PostgreSQL configuration
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'smartrewards2025';"
sudo -u postgres psql -c "CREATE DATABASE smart_rewards;"

# Prisma schema deployment
npx prisma generate
npx prisma db push
```

### 3. Data Migration
```bash
# Data imported from local development
# Used custom Node.js script (import-data.js)
# Successfully imported:
# - 160 users (customers + businesses)
# - 12,028+ transactions
# - 308+ offers
# - 19 badges
# - Complete business profiles with locations
```

### 4. Application Build
```bash
# Memory optimization for build process
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

# Added 2GB swap space to handle build memory requirements
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 5. Process Management (PM2)
```bash
# PM2 ecosystem configuration
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 👥 Test Accounts

### Customer Accounts
- **Primary Test Account**: takudzwa@smart.com / password: takudzwa
- **Additional Accounts**: See `users_details.md` for complete list
- **Total**: 100 customer accounts with Zimbabwean names

### Business Accounts
- **Business Accounts**: Available in `users_details.md`
- **Total**: 60 business accounts with Zimbabwean business names
- **All passwords**: takudzwa

---

## 🎯 Application Features

### Core Functionality
- ✅ **User Registration & Authentication** (Customer/Business)
- ✅ **Business Profile Management** (Logo upload, location mapping)
- ✅ **Customer Dashboard** (Points, badges, recommendations)
- ✅ **Transaction History** (Real transaction data)
- ✅ **Badge Earning System** (19 different achievements)
- ✅ **Loyalty Programs** (Points rules, tiers, milestones)
- ✅ **Offers & Campaigns** (Business promotions)
- ✅ **Mukando Groups** (Community savings)

### AI-Powered Features
- ✅ **Business AI Insights** (Real data analysis and recommendations)
- ✅ **Customer AI Advisor** ("Takudzwanashe" chatbot)
- ✅ **Personalized Recommendations** (Based on user behavior)
- ✅ **Smart Analytics** (Customer segmentation, churn prediction)

### Additional Features
- ✅ **Interactive Maps** (Business location discovery)
- ✅ **File Upload System** (Business logos stored in `/uploads`)
- ✅ **Mobile Responsive Design** (Optimized for all devices)
- ✅ **Profile & Settings Pages** (Complete user management)

---

## 🔧 System Management

### PM2 Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs smart-rewards

# Restart application
pm2 restart smart-rewards

# Stop application
pm2 stop smart-rewards

# Delete application
pm2 delete smart-rewards
```

### Database Management
```bash
# Connect to database
PGPASSWORD=smartrewards2025 psql -h localhost -U postgres -d smart_rewards

# Check data counts
psql -c "SELECT 'Users: ' || COUNT(*) FROM \"User\";"
psql -c "SELECT 'Transactions: ' || COUNT(*) FROM \"Transaction\";"
```

### Server Management
```bash
# Check system resources
free -h
df -h
htop

# Nginx status
systemctl status nginx

# PostgreSQL status
systemctl status postgresql
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

1. **Application Not Starting**
   ```bash
   pm2 logs smart-rewards --err
   pm2 restart smart-rewards
   ```

2. **Database Connection Issues**
   ```bash
   systemctl restart postgresql
   export DATABASE_URL="postgresql://postgres:smartrewards2025@localhost:5432/smart_rewards"
   ```

3. **Memory Issues**
   ```bash
   # Check swap space
   free -h
   # Add more swap if needed
   sudo fallocate -l 4G /swapfile2
   ```

4. **Build Failures**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=2048"
   npm run build
   ```

---

## 📊 Performance Metrics

### Database Statistics
- **Total Users**: 160
- **Customer Accounts**: 100
- **Business Accounts**: 60
- **Transactions**: 12,028+
- **Offers**: 308+
- **Badges**: 19
- **Database Size**: ~7.7MB (export file)

### Application Performance
- **Build Time**: ~2-3 minutes (with memory optimization)
- **Startup Time**: ~10-15 seconds
- **Memory Usage**: ~50MB (PM2 reported)
- **Response Time**: Fast (local database connection)

---

## 🔐 Security Notes

### Current Security Measures
- JWT authentication for API routes
- Password hashing with bcrypt
- Environment variables for sensitive data
- PostgreSQL user authentication
- File upload restrictions

### Recommended Improvements
- [ ] SSL/HTTPS setup with Let's Encrypt
- [ ] Firewall configuration (UFW)
- [ ] Database backup automation
- [ ] Rate limiting for API endpoints
- [ ] Regular security updates

---

## 📋 Maintenance Tasks

### Daily
- [ ] Check PM2 application status
- [ ] Monitor system resources (memory, disk space)

### Weekly
- [ ] Review application logs
- [ ] Check database performance

### Monthly
- [ ] System security updates
- [ ] Database backup
- [ ] Performance optimization review

---

## 🔄 Update Procedure

### Code Updates
```bash
cd /var/www/smart-rewards
git pull origin main
npm install
npm run build
pm2 restart smart-rewards
```

### Database Schema Updates
```bash
npx prisma db push
pm2 restart smart-rewards
```

---

## 📞 Support Information

### Key Files for Debugging
- Application logs: `pm2 logs smart-rewards`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`
- Environment config: `/var/www/smart-rewards/.env`

### Important Scripts
- `import-data.js`: Data migration script
- `ecosystem.config.js`: PM2 configuration
- `deploy-to-droplet.sh`: Automated deployment script

---

## 🎉 Deployment Success

**Deployment Status**: ✅ SUCCESSFUL  
**Application URL**: http://159.65.58.153:3000  
**Deployment Time**: ~2 hours (including troubleshooting)  
**Data Migration**: Complete (100% of local data transferred)  

The Smart Rewards application is now fully deployed and operational with all features working as expected, including AI-powered insights, real-time recommendations, and comprehensive user management.

---

*Last Updated: August 19, 2025*
*Deployed by: Smart Rewards Development Team*
