# Farid-Cadet-Academy (FCA) — Full-Stack Web App Specification

## Overview

**Goal:** Build a multi-page, production-ready web app for *Farid-Cadet-Academy*, a cadet college preparation coaching led by Faridul Islam.

**Core Requirements:**

* Two languages: Bangla (bn) and English (en) with toggle.
* Theme toggle (light/dark/system).
* Pages: Home, Teachers, Facilities, Notices, Media, Contact, Login/Register.
* Registration collects: first name, last name, email, password (with confirmation), optional phone, and role (student, guardian, teacher). Teachers require code `FCA2025`.
* Uses **Supabase** for database, authentication, and storage.
* No AI or LLM integrations.

**Deployment:**

* Frontend → Vercel
* Backend → Render

---

## Tech Stack

* **Frontend:** SvelteKit + TailwindCSS + ShadCN-Svelte + Lucide Icons + Motion One
* **Backend:** Node.js (NestJS + Fastify)
* **Database:** Supabase (Postgres, Auth, Storage)
* **Language:** TypeScript

---

## Architecture

```
Frontend (SvelteKit, SSR/SPA)
  ↕ REST / Realtime
Backend (NestJS + Fastify)
  ↕ Supabase (Auth, DB, Storage)
```

Frontend handles UI, routing, translations, and animations. Backend handles secure API endpoints, registration verification, teacher approvals, and admin actions.

---

## Database Schema (Simplified)

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id uuid UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  phone text,
  role text DEFAULT 'student',
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id),
  verified boolean DEFAULT false,
  bio text,
  subjects text[]
);

CREATE TABLE notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  body text,
  language text,
  created_at timestamptz DEFAULT now()
);
```

---

## API Endpoints (Backend)

* `POST /auth/register` — Register new user (Supabase + validation)
* `POST /auth/login` — Login
* `POST /teachers/apply` — Apply as teacher (requires `FCA2025`)
* `GET /teachers` — List verified teachers
* `GET /notices` — Public notices
* `GET /media` — List public media
* `POST /media/upload` — Upload via Supabase Storage

---

## Frontend Pages

* `/` — Home (Hero, theme/language toggle)
* `/teachers` — Dynamic teacher cards
* `/facilities` — Academy facilities
* `/notices` — Notice board
* `/media` — Image/video gallery
* `/contact` — Form submission to backend
* `/auth/register` & `/auth/login` — Authentication pages

---

## UI/UX Guidelines

* Minimalistic, foggy aesthetic with vivid yet soft color palette.
* Motion One animations for interactivity.
* Use ShadCN-Svelte for modern UI components.
* Lucide for icons.

---

## Multilingual + Theme System

* `svelte-i18n` or custom store for Bangla/English toggle.
* Theme state stored in localStorage and reflected via Tailwind class (`dark`).

---

## Deployment

* **Frontend:** Vercel build using `npm run build` and `npm run preview`.
* **Backend:** Render deployment with Docker or Node process.
* **Database:** Supabase hosted instance.

---

## Security

* Use Supabase Auth for credentials.
* Validate all teacher registrations with `FCA2025` code.
* RLS enabled on Supabase tables.
* JWT verification in backend using Supabase public keys.

---

## Summary

A secure, multilingual, aesthetic, and high-performance web application stack:

* **Frontend:** SvelteKit + TailwindCSS + ShadCN-Svelte
* **Backend:** NestJS (Fastify)
* **Database:** Supabase
* **Deploy:** Vercel (frontend) + Render (backend)
  This setup ensures scalability, modern design, and elite-level backend capabilities.

For information view the [FCA](./fca.md)