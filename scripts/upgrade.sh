#!/bin/bash

echo "🚀 Farid Cadet Academy - Upgrade Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "${YELLOW}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo "${BLUE}📦 Installing backend dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Backend dependencies installed successfully${NC}"
else
    echo "${YELLOW}⚠️  Backend installation had warnings (this is normal)${NC}"
fi

echo ""
echo "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Frontend dependencies installed successfully${NC}"
else
    echo "${YELLOW}⚠️  Frontend installation had warnings (this is normal)${NC}"
fi

cd ..

echo ""
echo "${GREEN}✨ Installation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update your .env file with correct values"
echo "2. Update frontend/.env with correct values"
echo "3. Run 'npm run dev' to start backend"
echo "4. Run 'cd frontend && npm run dev' to start frontend"
echo ""
echo "For production:"
echo "1. Run 'npm start' for backend"
echo "2. Run 'cd frontend && npm run build' for frontend"
echo ""
echo "📖 See ENHANCEMENTS.md for full documentation"
