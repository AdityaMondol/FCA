-- Improved Database Policies for Farid Cadet Academy
-- This file contains optimized and secure RLS policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies if they exist
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

-- Users policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow teachers to view all users (for admin purposes)
CREATE POLICY "Teachers can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users AS u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('teacher', 'admin')
        )
    );

-- Teacher verification codes policies
CREATE POLICY "Anyone can read active verification codes" ON teacher_verification_codes
    FOR SELECT USING (is_active = true);

-- Notices policies
-- Allow public read access for active notices
CREATE POLICY "Public read access for active notices" ON notices
    FOR SELECT USING (is_active = true);

-- Allow teachers to create notices
CREATE POLICY "Teachers can create notices" ON notices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

-- Allow teachers to update their own notices
CREATE POLICY "Teachers can update own notices" ON notices
    FOR UPDATE USING (
        created_by = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

-- Allow teachers to delete their own notices
CREATE POLICY "Teachers can delete own notices" ON notices
    FOR DELETE USING (
        created_by = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

-- Media policies
-- Allow public read access for active media
CREATE POLICY "Public read access for active media" ON media
    FOR SELECT USING (is_active = true);

-- Allow teachers to upload media
CREATE POLICY "Teachers can upload media" ON media
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

-- Allow teachers to delete their own media
CREATE POLICY "Teachers can delete own media" ON media
    FOR DELETE USING (
        uploaded_by = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

-- Contacts policies
-- Allow anyone to submit contacts
CREATE POLICY "Anyone can submit contacts" ON contacts
    FOR INSERT WITH CHECK (true);

-- Allow teachers to view contacts
CREATE POLICY "Teachers can view contacts" ON contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

-- Allow teachers to update contact status
CREATE POLICY "Teachers can update contact status" ON contacts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

-- Teacher profiles policies
-- Allow public read access for teacher profiles
CREATE POLICY "Public read access for teacher profiles" ON teacher_profiles
    FOR SELECT USING (true);

-- Allow teachers to manage their own profile
CREATE POLICY "Teachers can manage own profile" ON teacher_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
            AND users.id = user_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
            AND users.id = user_id
        )
    );

-- Create indexes for better query performance
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

-- Grant necessary permissions
GRANT ALL ON TABLE users TO authenticated;
GRANT ALL ON TABLE teacher_verification_codes TO authenticated;
GRANT ALL ON TABLE notices TO authenticated;
GRANT ALL ON TABLE media TO authenticated;
GRANT ALL ON TABLE contacts TO authenticated;
GRANT ALL ON TABLE teacher_profiles TO authenticated;