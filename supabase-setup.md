# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project name: "fca-web-app"
6. Enter database password (save this securely)
7. Choose region closest to your users
8. Click "Create new project"

## 2. Get Project Credentials

After project creation, go to Settings > API:

1. **Project URL**: Copy the URL (looks like `https://xxxxx.supabase.co`)
2. **Anon Key**: Copy the `anon` `public` key
3. **Service Role Key**: Copy the `service_role` `secret` key (keep this secure)

## 3. Update Configuration Files

### Backend (.env file)
Create `backend/.env` with:
```
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_random_jwt_secret_here
PORT=3000
FRONTEND_URL=http://localhost:5173
TEACHER_CODE=FCA2025
```

### Frontend (supabase.ts)
Update `frontend/src/lib/supabase.ts`:
- Replace `supabaseUrl` with your project URL
- Replace `supabaseAnonKey` with your anon key

## 4. Enable Authentication

In Supabase Dashboard:
1. Go to Authentication > Settings
2. Enable "Enable email confirmations" (optional)
3. Configure any additional auth providers if needed

## 5. Next Steps

After completing this setup:
1. Run the database schema creation (Task 4)
2. Configure Row Level Security policies (Task 5)
3. Test the connection from both frontend and backend

## Security Notes

- Never commit the `.env` file to version control
- Keep the service role key secure - it bypasses RLS
- Use environment variables in production deployments