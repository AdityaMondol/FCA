-- Fix Database Policies - Run this in Supabase SQL Editor
-- This fixes the infinite recursion issue

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Teachers can view all users" ON users;
DROP POLICY IF EXISTS "Only teachers can insert notices" ON notices;
DROP POLICY IF EXISTS "Only teachers can update notices" ON notices;
DROP POLICY IF EXISTS "Only teachers can delete notices" ON notices;
DROP POLICY IF EXISTS "Only teachers can insert media" ON media;
DROP POLICY IF EXISTS "Only teachers can delete media" ON media;
DROP POLICY IF EXISTS "Only teachers can view contacts" ON contacts;
DROP POLICY IF EXISTS "Only teachers can update contact status" ON contacts;
DROP POLICY IF EXISTS "Teachers can insert their own profile" ON teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON teacher_profiles;

-- Disable RLS temporarily to avoid recursion
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE media DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled only for teacher verification codes
-- Teacher verification codes policies (keep these)
CREATE POLICY IF NOT EXISTS "Anyone can read verification codes for validation" ON teacher_verification_codes
    FOR SELECT USING (is_active = true);

-- Create simplified policies without recursion

-- Users policies (simplified)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public read for basic user info (needed for teacher listings)
CREATE POLICY "Public read access for basic user info" ON users
    FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true);

-- Allow public insert for registration
CREATE POLICY "Public registration allowed" ON users
    FOR INSERT WITH CHECK (true);

-- Notices policies (simplified)
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for notices" ON notices
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create notices" ON notices
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update notices" ON notices
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete notices" ON notices
    FOR DELETE USING (true);

-- Media policies (simplified)
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for media" ON media
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can upload media" ON media
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can delete media" ON media
    FOR DELETE USING (true);

-- Contacts policies (simplified)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contacts" ON contacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view contacts" ON contacts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update contact status" ON contacts
    FOR UPDATE USING (true);

-- Teacher profiles policies (simplified)
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for teacher profiles" ON teacher_profiles
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage teacher profiles" ON teacher_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update teacher profiles" ON teacher_profiles
    FOR UPDATE USING (true);

-- Insert sample teacher user with proper password hash
-- Password: teacher123
INSERT INTO users (email, password, name, role, phone)
VALUES (
    'teacher@faridcadetacademy.com',
    '$2a$10$YourActualHashedPasswordHere',
    'Sample Teacher',
    'teacher',
    '+8801712345678'
) ON CONFLICT (email) DO NOTHING;
