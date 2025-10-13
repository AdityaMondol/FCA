-- Farid Cadet Academy - Enhanced Database Schema
-- Execute these commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enhanced Users table with 3 roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'guardian', 'teacher')),
    profile_photo_url TEXT,
    description TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    verification_code_used VARCHAR(50), -- Track which code was used to become teacher
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher verification codes table
CREATE TABLE IF NOT EXISTS teacher_verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    max_usage INTEGER DEFAULT NULL, -- NULL means unlimited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- Create enhanced Notices table
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    content_en TEXT NOT NULL,
    content_bn TEXT NOT NULL,
    tags TEXT[], -- Array of tags for categorization
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    expire_date TIMESTAMP WITH TIME ZONE, -- Optional expiration date
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced Media table
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT, -- Optional description
    tags TEXT[], -- Array of tags for categorization
    url TEXT NOT NULL,
    file_type VARCHAR(50) CHECK (file_type IN ('image', 'video')),
    file_size BIGINT, -- File size in bytes
    uploaded_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Teacher Profiles table (additional info for teachers)
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    subject_specialization VARCHAR(255),
    experience_years INTEGER,
    education_background TEXT,
    achievements TEXT,
    display_order INTEGER DEFAULT 0, -- For ordering on teacher page
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_tags ON notices USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notices_expire_date ON notices(expire_date);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_display_order ON teacher_profiles(display_order);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at BEFORE UPDATE ON teacher_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password, name, role)
VALUES (
    'admin@faridcadetacademy.com',
    '$2a$10$YourHashedPasswordHere',
    'Admin User',
    'teacher'
) ON CONFLICT (email) DO NOTHING;

-- RLS (Row Level Security) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher')
    );

-- Teacher verification codes policies
CREATE POLICY "Anyone can read verification codes for validation" ON teacher_verification_codes
    FOR SELECT USING (is_active = true);

-- Notices policies
CREATE POLICY "Notices are viewable by everyone" ON notices
    FOR SELECT USING (is_active = true);

CREATE POLICY "Only teachers can insert notices" ON notices
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher')
    );

CREATE POLICY "Only teachers can update notices" ON notices
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher')
    );

CREATE POLICY "Only teachers can delete notices" ON notices
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher')
    );

-- Media policies
CREATE POLICY "Media are viewable by everyone" ON media
    FOR SELECT USING (is_active = true);

CREATE POLICY "Only teachers can insert media" ON media
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher')
    );

CREATE POLICY "Only teachers can delete media" ON media
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher')
    );

-- Contacts policies
CREATE POLICY "Anyone can submit contacts" ON contacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only teachers can view contacts" ON contacts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher')
    );

CREATE POLICY "Only teachers can update contact status" ON contacts
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher')
    );

-- Teacher profiles policies
CREATE POLICY "Teacher profiles are viewable by everyone" ON teacher_profiles
    FOR SELECT USING (true);

CREATE POLICY "Teachers can insert their own profile" ON teacher_profiles
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher' AND users.id = user_id)
    );

CREATE POLICY "Teachers can update their own profile" ON teacher_profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher' AND users.id = user_id)
    );

-- Create Storage Bucket for media files
-- Run this in Supabase Dashboard -> Storage
-- Bucket name: media
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/*, video/*

-- Bucket name: profile-photos
-- Public: true  
-- File size limit: 2MB
-- Allowed MIME types: image/*

-- Sample data
INSERT INTO notices (title_en, title_bn, content_en, content_bn, priority, tags, created_by)
SELECT 
    'Admission Open for 2025',
    '২০২৫ এর জন্য ভর্তি খোলা',
    'Admissions are now open for the upcoming academic session. Limited seats available. Apply now!',
    'আগামী শিক্ষাবর্ষের জন্য ভর্তি এখন খোলা। সীমিত আসন উপলব্ধ। এখনই আবেদন করুন!',
    'high',
    ARRAY['admission', 'important', '2025'],
    id
FROM users WHERE role = 'teacher' LIMIT 1
ON CONFLICT DO NOTHING;
