<div align="center">
  <img src="frontend/public/favicon.png" alt="Farid Cadet Academy Logo" width="120" height="120">
  
  # Farid Cadet Academy
  
  **Preparing Future Leaders for Cadet Colleges in Bangladesh**
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)
  [![Svelte](https://img.shields.io/badge/Svelte-4-orange)](https://svelte.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Cloud-blue)](https://supabase.com/)
  
  A production-ready full-stack web application built with **Svelte**, **TailwindCSS**, **Node.js/Express**, and **Supabase**.
  
  [Live Demo](https://farid-cadet.Vercel.app) • 
  [Documentation](#documentation) • 
  [Features](#features) • 
  [Installation](#installation)
</div>

## 🌟 About Farid Cadet Academy

Farid Cadet Academy is a premier coaching institution in Tangail, Bangladesh, dedicated to preparing students for competitive entrance examinations into cadet colleges. With a proven track record of success, we provide comprehensive coaching in:

- **Bengali (Bangla)**
- **English**
- **Mathematics**
- **General Knowledge**

Our academy offers multiple learning options including day coaching, night coaching, and residential programs to accommodate diverse student needs.

## ✨ Key Features

### 🌐 Bilingual & Accessible
- **Complete Bangla and English language support** with seamless switching
- **Responsive design** optimized for all devices (mobile, tablet, desktop)
- **Dark/light theme toggling** with smooth transitions

### 🔐 Secure Authentication
- **JWT-based authentication** with Supabase Auth
- **Role-based access control** (Student, Guardian, Teacher)
- **Password encryption** with bcrypt
- **Email verification** for new registrations

### 🎨 Premium User Experience
- **Modern, impressive design** with red and yellow branding
- **Smooth animations** and transitions
- **High-performance loading** with Vite build tool
- **Optimized assets** for fast delivery

### 🛠️ Comprehensive Admin Panel
- **Notice management** (create, update, delete)
- **Media gallery** (image/video upload with Supabase Storage)
- **Contact form submissions** management
- **Teacher profile management**
- **Role assignment** and user management

## 🚀 Technologies Used

### Frontend
| Technology | Purpose |
|------------|---------|
| **Svelte 4** | Reactive JavaScript framework |
| **TailwindCSS 3** | Utility-first CSS framework |
| **Svelte Routing** | Client-side routing |
| **Vite** | Next-generation build tool |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web application framework |
| **Supabase** | PostgreSQL database and storage |
| **JWT** | Secure authentication |
| **Bcrypt** | Password hashing |
| **Multer** | File upload handling |

## 📁 Project Structure

```
FCA/
├── frontend/                 # Svelte frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Svelte stores (theme, language, auth)
│   │   ├── utils/           # Frontend utilities
│   │   ├── App.svelte       # Main app component
│   │   ├── main.js          # Entry point
│   │   └── app.css          # Global styles
│   ├── public/              # Static assets
│   ├── dist/                # Production build
│   └── [config files]       # Vite, Tailwind, etc.
├── utils/                   # Backend utilities
├── db/                      # Database schemas and scripts
├── server.js                # Express server with API routes
├── package.json             # Backend dependencies
└── [config files]           # Environment, deployment configs
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/farid-cadet-academy.git
cd farid-cadet-academy

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Set up environment variables (see below)

# Run in development mode
npm run dev        # Backend server
npm run frontend   # Frontend development server
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (change this to a random string)
JWT_SECRET=your_random_secret_key_for_jwt

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Database Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Go to SQL Editor and execute the scripts in `db/schema.sql`
3. Create storage buckets:
   - `media` (public access)
   - `profile-photos` (public access)
4. Configure Row Level Security (RLS) policies

### Build for Production

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Start production server
npm start
```

## 🌐 Pages & Features

| Page | Features |
|------|----------|
| **Home** | Hero section, stats, achievements, call-to-action |
| **About Us** | Mission, vision, and academy information |
| **Facilities** | Day/night coaching, residential programs |
| **Teachers** | Faculty profiles and qualifications |
| **Media Gallery** | Photos and videos from academy events |
| **Notices** | Latest announcements and important notices |
| **Contact** | Contact form and location information |
| **Dashboard** | User profile management |
| **Admin Panel** | Content management system |

## 🔌 API Endpoints

### Public Routes
- `GET /api/academy-info` - Get academy information
- `GET /api/notices` - Get all notices (with pagination)
- `GET /api/media` - Get all media items (with pagination)
- `GET /api/teachers` - Get all teachers
- `POST /api/contact` - Submit contact form

### Authentication Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - User logout

### Protected Routes
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/change-role` - Change user role
- `DELETE /api/delete-account` - Delete user account

### Admin Routes
- `POST /api/notices` - Create notice
- `DELETE /api/notices/:id` - Delete notice
- `POST /api/media` - Upload media
- `DELETE /api/media/:id` - Delete media
- `GET /api/contacts` - View contact submissions

## 🎨 Customization

### Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: '#DC2626',  // Red
  secondary: '#FBBF24' // Yellow
}
```

### Translations
Edit `frontend/src/stores/languageStore.js` to modify or add translations.

### Content
Update the translation files and page components in `frontend/src/pages/`.

## 🔒 Security Features

- **Password encryption** using bcrypt
- **JWT tokens** for secure authentication
- **Row Level Security (RLS)** on Supabase tables
- **Input validation** and sanitization
- **Rate limiting** for authentication endpoints
- **Protected admin routes**
- **CORS configuration** for security
- **File type validation** for uploads

## ☁️ Deployment

### Backend (Node.js)
Deploy to any Node.js hosting service:
```bash
# Render.com
# Railway.app
# Heroku
# DigitalOcean App Platform
```

### Frontend
The frontend is built into the `dist` folder and can be deployed to:
```bash
# Vercel
# Vercel
# GitHub Pages
# Any static hosting service
```

### Environment Variables
Ensure all environment variables are set in your hosting platform.

## 👨‍🏫 Admin Panel

To create an admin user:
1. Hash a password using bcrypt
2. Insert directly into Supabase `users` table with role='teacher' or 'admin'
3. Or use the registration form with a valid teacher verification code

Teacher verification codes can be managed in the `teacher_verification_codes` table.

## 📞 Contact Information

**Farid Cadet Academy**
- 📍 Walton More, Mymensingh road, Tangail Sadar, Tangail
- 📞 01715-000090
- 📞 01928-268993
- 📞 01674-455000

## 🤝 Support & Contributing

For technical issues or questions, please [open an issue](https://github.com/yourusername/farid-cadet-academy/issues).

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped with this project
- Special thanks to the Farid Cadet Academy team for their support
- Built with ❤️ using modern web technologies

---

<div align="center">
  
  **Made with ❤️ for Farid Cadet Academy**
  
  [![GitHub](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/yourusername/farid-cadet-academy)
  [![Vercel](https://img.shields.io/badge/Vercel-Live%20Demo-blue)](https://farid-cadet.Vercel.app)
  
</div>