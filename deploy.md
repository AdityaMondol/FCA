# Deployment Guide

## Quick Fixes Applied

The following TypeScript errors have been fixed:
- ✅ ValidationPipe method name conflict resolved
- ✅ Missing @nestjs/platform-express dependency added
- ✅ Missing @types/multer dependency added
- ✅ Profile type casting issues resolved
- ✅ Multer file type issues resolved

## Backend Deployment (Render)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Fix TypeScript errors for deployment"
   git push origin main
   ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Create new Web Service
   - Set build command: `npm install && npm run build`
   - Set start command: `npm run start:prod`
   - Add environment variables:
     ```
     NODE_ENV=production
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_key
     JWT_SECRET=your_jwt_secret
     TEACHER_CODE=FCA2025
     FRONTEND_URL=https://your-frontend.vercel.app
     ```

## Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Framework preset: SvelteKit
   - Build command: `npm run build`
   - Output directory: `build`

2. **Update API URLs**
   - Update `vercel.json` with your Render backend URL
   - Update frontend API calls to use your backend URL

## Database Setup (Supabase)

1. **Run SQL Scripts**
   ```sql
   -- Run in Supabase SQL Editor
   -- 1. database/schema.sql
   -- 2. database/rls-policies.sql
   -- 3. database/contact-table.sql (optional)
   -- 4. database/seed-data.sql (optional)
   ```

2. **Configure Storage**
   - Create a storage bucket named "media"
   - Set appropriate permissions for file uploads

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-jwt-secret
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app
TEACHER_CODE=FCA2025
```

### Frontend (Supabase config)
Update `frontend/src/lib/supabase.ts`:
```typescript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

## Testing the Deployment

1. **Backend Health Check**
   ```
   GET https://your-backend.render.com/health
   ```

2. **Frontend Pages**
   - Home: https://your-frontend.vercel.app/
   - Teachers: https://your-frontend.vercel.app/teachers
   - Contact: https://your-frontend.vercel.app/contact

3. **API Endpoints**
   - GET /teachers (public)
   - GET /notices (public)
   - GET /media (public)
   - POST /auth/register (public)
   - POST /auth/login (public)

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update FRONTEND_URL in backend environment
2. **Database Connection**: Check Supabase credentials
3. **File Upload**: Ensure media bucket exists in Supabase Storage
4. **Authentication**: Verify JWT_SECRET is set

### Logs
- **Render**: Check deployment logs in Render dashboard
- **Vercel**: Check function logs in Vercel dashboard
- **Supabase**: Check logs in Supabase dashboard

The application should now deploy successfully! 🚀