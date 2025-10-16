#!/bin/bash

echo "🚀 Deploying Farid Cadet Academy to Vercel"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "${RED}❌ Vercel CLI is not installed${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo "${BLUE}📦 Step 1: Installing dependencies...${NC}"
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "${BLUE}🔧 Step 2: Setting up environment variables...${NC}"

# Set environment variables in Vercel
vercel env add VITE_SUPABASE_URL production <<< "https://husfemrigonousvtuyvf.supabase.co"
vercel env add VITE_SUPABASE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2ZlbXJpZ29ub3VzdnR1eXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTYxMjAsImV4cCI6MjA3NTU3MjEyMH0.0imHOgQzLen4KfZ_L_i_tvzsj0phRwpES4oceZq2GXE"
vercel env add VITE_API_URL production <<< "https://fca-3oz1.onrender.com"
vercel env add VITE_APP_NAME production <<< "Farid Cadet Academy"
vercel env add VITE_APP_VERSION production <<< "2.0.0"
vercel env add VITE_ENABLE_ANALYTICS production <<< "true"
vercel env add VITE_ENABLE_REALTIME production <<< "true"
vercel env add VITE_ENABLE_NOTIFICATIONS production <<< "true"
vercel env add VITE_NODE_ENV production <<< "production"

echo "${GREEN}✅ Environment variables configured${NC}"
echo ""

echo "${BLUE}🏗️  Step 3: Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo "${RED}❌ Build failed${NC}"
    exit 1
fi

echo "${GREEN}✅ Build successful${NC}"
echo ""

echo "${BLUE}🚀 Step 4: Deploying to Vercel...${NC}"
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}========================================${NC}"
    echo "${GREEN}✅ Deployment successful!${NC}"
    echo "${GREEN}========================================${NC}"
    echo ""
    echo "Your application is now live!"
    echo "Check your Vercel dashboard for the URL"
else
    echo "${RED}❌ Deployment failed${NC}"
    exit 1
fi

cd ..
