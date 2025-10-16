#!/bin/bash

echo "🔧 Setting up Vercel Environment Variables"
echo "=========================================="
echo ""

cd frontend

# Production environment
echo "Setting PRODUCTION environment variables..."
echo "https://husfemrigonousvtuyvf.supabase.co" | vercel env add VITE_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2ZlbXJpZ29ub3VzdnR1eXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTYxMjAsImV4cCI6MjA3NTU3MjEyMH0.0imHOgQzLen4KfZ_L_i_tvzsj0phRwpES4oceZq2GXE" | vercel env add VITE_SUPABASE_KEY production
echo "https://fca-3oz1.onrender.com" | vercel env add VITE_API_URL production
echo "Farid Cadet Academy" | vercel env add VITE_APP_NAME production
echo "2.0.0" | vercel env add VITE_APP_VERSION production
echo "true" | vercel env add VITE_ENABLE_ANALYTICS production
echo "true" | vercel env add VITE_ENABLE_REALTIME production
echo "true" | vercel env add VITE_ENABLE_NOTIFICATIONS production
echo "production" | vercel env add VITE_NODE_ENV production

# Preview environment
echo ""
echo "Setting PREVIEW environment variables..."
echo "https://husfemrigonousvtuyvf.supabase.co" | vercel env add VITE_SUPABASE_URL preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2ZlbXJpZ29ub3VzdnR1eXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTYxMjAsImV4cCI6MjA3NTU3MjEyMH0.0imHOgQzLen4KfZ_L_i_tvzsj0phRwpES4oceZq2GXE" | vercel env add VITE_SUPABASE_KEY preview
echo "https://fca-3oz1.onrender.com" | vercel env add VITE_API_URL preview
echo "Farid Cadet Academy" | vercel env add VITE_APP_NAME preview
echo "2.0.0" | vercel env add VITE_APP_VERSION preview
echo "true" | vercel env add VITE_ENABLE_ANALYTICS preview
echo "true" | vercel env add VITE_ENABLE_REALTIME preview
echo "true" | vercel env add VITE_ENABLE_NOTIFICATIONS preview
echo "preview" | vercel env add VITE_NODE_ENV preview

# Development environment
echo ""
echo "Setting DEVELOPMENT environment variables..."
echo "https://husfemrigonousvtuyvf.supabase.co" | vercel env add VITE_SUPABASE_URL development
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2ZlbXJpZ29ub3VzdnR1eXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTYxMjAsImV4cCI6MjA3NTU3MjEyMH0.0imHOgQzLen4KfZ_L_i_tvzsj0phRwpES4oceZq2GXE" | vercel env add VITE_SUPABASE_KEY development
echo "http://localhost:3000" | vercel env add VITE_API_URL development
echo "Farid Cadet Academy" | vercel env add VITE_APP_NAME development
echo "2.0.0" | vercel env add VITE_APP_VERSION development
echo "true" | vercel env add VITE_ENABLE_ANALYTICS development
echo "true" | vercel env add VITE_ENABLE_REALTIME development
echo "true" | vercel env add VITE_ENABLE_NOTIFICATIONS development
echo "development" | vercel env add VITE_NODE_ENV development

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "Next steps:"
echo "1. Run: vercel --prod"
echo "2. Or use: ../deploy-vercel.sh"

cd ..
