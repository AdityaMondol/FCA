# Backend Setup Guide

## 🚨 **Current Issues & Solutions**

### **Issue 1: Missing Environment Variables**
The backend can't connect to the database because `.env` file is missing.

### **Issue 2: Dependencies Not Installed**
Backend dependencies might not be properly installed.

## 📋 **Step-by-Step Setup**

### **Step 1: Install Dependencies**
```bash
# In the root directory (a:\FCA)
npm install
```

### **Step 2: Create Environment File**
1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Open `.env` file and configure these values:

```env
# Basic Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=FCA-2025-secure-jwt-secret-key-change-this-in-production

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here
```

### **Step 3: Set Up Supabase Database**

#### **Option A: Use Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env`
4. Run the SQL from `database-schema-enhanced.sql` in Supabase SQL Editor

#### **Option B: Use Local Database (Advanced)**
1. Install PostgreSQL locally
2. Create database: `createdb farid_cadet_academy`
3. Run: `psql farid_cadet_academy < database-schema-enhanced.sql`

### **Step 4: Test Backend**
```bash
# Start backend only
npm run dev

# You should see:
# ✅ Database connection successful
# 🌐 Server: http://localhost:3000
```

### **Step 5: Test Registration**
```bash
# Test registration endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

## 🔧 **Troubleshooting**

### **Problem: "Database connection failed"**
- Check your `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Ensure Supabase project is active
- Verify internet connection

### **Problem: "Cannot find module"**
```bash
# Delete node_modules and reinstall
rmdir /s node_modules
npm install
```

### **Problem: "Port 3000 already in use"**
```bash
# Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### **Problem: No logs showing**
- Check if `nodemon` is installed: `npm list nodemon`
- If not: `npm install -g nodemon`

## 📊 **Expected Console Output**

When backend starts successfully, you should see:
```
========================================
🚀 Farid Cadet Academy Backend Server
========================================
📅 Started at: [timestamp]
🌐 Port: 3000
📂 Environment: development
🔐 Supabase URL: https://xxxxx.supabase.co...
🔑 Supabase Key: eyJhbGciOiJIUzI1NiIs...
🔌 Testing database connection...
✅ Database connection successful

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       Farid Cadet Academy - Server Running                ║
║                                                           ║
║       🌐 Server: http://localhost:3000                    ║
║       📚 Academy: Farid Cadet Academy                     ║
║       📍 Location: Tangail, Bangladesh                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## 🎯 **Quick Test Commands**

Test all endpoints:
```bash
# Health check
curl http://localhost:3000/api/health

# Register student
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"student"}'

# Register teacher (needs code)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Teacher","email":"jane@example.com","password":"password123","role":"teacher","teacherCode":"FCA2025"}'

# Get teachers
curl http://localhost:3000/api/teachers
```

## 🆘 **Still Having Issues?**

1. Check if both frontend and backend ports are free
2. Ensure `.env` file exists and has correct values
3. Try running backend and frontend separately
4. Check Windows Firewall/Antivirus blocking the ports

**Contact Support:** Provide the console output and error messages for better assistance.
