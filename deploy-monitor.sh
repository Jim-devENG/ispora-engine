#!/bin/bash

# iSpora Health Monitor Deployment Script
# Deploys the health monitoring system to your VPS

echo "🚀 Deploying iSpora Health Monitor..."

# Create logs directory
mkdir -p logs

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Stop existing monitor if running
echo "🛑 Stopping existing monitor..."
pm2 stop ispora-health-monitor 2>/dev/null || true
pm2 delete ispora-health-monitor 2>/dev/null || true

# Start the monitor
echo "🔍 Starting health monitor..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

echo "✅ Health monitor deployed successfully!"
echo "📊 Monitor status:"
pm2 status

echo "📝 View logs with: pm2 logs ispora-health-monitor"
echo "🔄 Restart with: pm2 restart ispora-health-monitor"
echo "🛑 Stop with: pm2 stop ispora-health-monitor"

