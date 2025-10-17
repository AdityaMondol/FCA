# Farid Cadet Academy Web Application

A modern, multilingual web application for Farid Cadet Academy - a cadet college preparation institute in Tangail, Bangladesh.

## Features

- **Multilingual Support**: Bangla and English with easy language switching
- **Theme System**: Light, dark, and system theme options
- **Authentication**: Secure user registration and login with role-based access
- **Teacher Management**: Special teacher verification system with admin approval
- **Content Management**: Notices, media gallery, and academy information
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Built with ShadCN-Svelte components and TailwindCSS

## Tech Stack

### Frontend
- **SvelteKit** - Modern web framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **ShadCN-Svelte** - Beautiful UI components
- **Lucide Icons** - Consistent iconography
- **Motion One** - Smooth animations
- **svelte-i18n** - Internationalization

### Backend
- **NestJS** - Scalable Node.js framework
- **Fastify** - High-performance web server
- **TypeScript** - Type-safe development
- **JWT** - Secure authentication
- **Class Validator** - Input validation

### Database & Services
- **Supabase** - PostgreSQL database with auth and storage
- **Row Level Security** - Database-level security policies

## Project Structure

```
├── frontend/          # SvelteKit frontend application
├── backend/           # NestJS backend API
├── database/          # Database schema and migrations
└── docs/             # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fca-web-app
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL scripts in `database/` folder
   - Get your project URL and API keys

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Supabase credentials
   npm run start:dev
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Update Supabase config in src/lib/supabase.ts
   npm run dev
   ```

## Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables from `.env.example`
4. Deploy using the provided `render.yaml`

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set framework preset to SvelteKit
3. Update API URLs in `vercel.json`
4. Deploy

### Database (Supabase)
1. Run `database/schema.sql` in SQL Editor
2. Run `database/rls-policies.sql` for security
3. Optionally run `database/seed-data.sql` for sample data

## Key Features

### Authentication System
- User registration with role selection (student, guardian, teacher)
- Special teacher verification with code "FCA2025"
- JWT-based authentication with refresh tokens
- Role-based access control

### Multilingual Support
- Complete Bangla and English translations
- Language preference persistence
- RTL support for Bangla text where needed

### Content Management
- Notice board with language filtering
- Media gallery with image and video support
- Teacher profiles with verification system
- Contact form with admin management

### Security Features
- Row Level Security (RLS) policies
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload with type validation

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Teachers
- `GET /teachers` - List verified teachers
- `POST /teachers/apply` - Apply as teacher
- `PUT /teachers/:id/verify` - Verify teacher (admin only)

### Notices
- `GET /notices` - List published notices
- `POST /notices` - Create notice (admin/teacher)
- `PUT /notices/:id` - Update notice

### Media
- `GET /media` - List public media
- `POST /media/upload` - Upload media file
- `DELETE /media/:id` - Delete media

### Contact
- `POST /contact/submit` - Submit contact form
- `GET /contact/info` - Get academy information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email info@faridcadetacademy.com or contact the development team.