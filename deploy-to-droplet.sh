#!/bin/bash

# Smart Rewards Deployment Script for Digital Ocean Droplet
# Run this script as root on the droplet

set -e  # Exit on any error

echo "🚀 Starting Smart Rewards deployment..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install other dependencies
echo "📦 Installing PostgreSQL, Nginx, and other tools..."
apt-get install -y postgresql postgresql-contrib nginx certbot python3-certbot-nginx git build-essential

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Setup PostgreSQL
echo "🗄️ Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE smart_rewards;
CREATE USER smart_rewards_user WITH ENCRYPTED PASSWORD 'SmartRewards2024!';
GRANT ALL PRIVILEGES ON DATABASE smart_rewards TO smart_rewards_user;
ALTER USER smart_rewards_user CREATEDB;
\q
EOF

# Clone the repository
echo "📂 Cloning Smart Rewards repository..."
cd /var/www
git clone https://github.com/TakudzwanasheSamuel/smart-rewards-zw.git smart-rewards
cd smart-rewards

# Install dependencies
echo "📦 Installing application dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Setup environment variables
echo "⚙️ Setting up environment variables..."
cat > .env << EOF
# Database
DATABASE_URL="postgresql://smart_rewards_user:SmartRewards2024!@localhost:5432/smart_rewards"

# Authentication
JWT_SECRET="smart-rewards-droplet-jwt-secret-2024-secure-zimbabwe"
NEXTAUTH_URL="http://159.65.58.153"

# AI/Genkit
GENKIT_ENV="prod"
GEMINI_API_KEY="AIzaSyAWiGCCI2ynk5mIT4nn_HzYaHV8vhLYZXA"
EOF

# Build the application
echo "🔨 Building the application..."
npm run build

# Setup Nginx configuration
echo "🌐 Setting up Nginx..."
cat > /etc/nginx/sites-available/smart-rewards << EOF
server {
    listen 80;
    server_name 159.65.58.153;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/smart-rewards /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Setup PM2 to run the app
echo "🚀 Setting up PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'smart-rewards',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Start the application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup firewall
echo "🔥 Setting up firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo "✅ Basic deployment completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Import your database using the complete-database-recreation.sql file"
echo "2. Test the application at http://159.65.58.153"
echo "3. Optionally setup SSL with: certbot --nginx -d yourdomain.com"
echo ""
echo "🔧 Useful commands:"
echo "- Check app status: pm2 status"
echo "- View app logs: pm2 logs smart-rewards"
echo "- Restart app: pm2 restart smart-rewards"
echo "- Check nginx status: systemctl status nginx"
