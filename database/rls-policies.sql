-- Row Level Security Policies for Farid Cadet Academy
-- Run this after schema.sql to enable security

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Profiles table policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (supabase_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (supabase_user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE supabase_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE supabase_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Service role can insert profiles (for registration)
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Teachers table policies
-- Public can view verified teachers
CREATE POLICY "Public can view verified teachers" ON teachers
  FOR SELECT USING (verified = true);

-- Teachers can view their own record
CREATE POLICY "Teachers can view own record" ON teachers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = teachers.profile_id 
      AND profiles.supabase_user_id = auth.uid()
    )
  );

-- Teachers can update their own record
CREATE POLICY "Teachers can update own record" ON teachers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = teachers.profile_id 
      AND profiles.supabase_user_id = auth.uid()
    )
  );

-- Teachers can insert their own record
CREATE POLICY "Teachers can insert own record" ON teachers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = teachers.profile_id 
      AND profiles.supabase_user_id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Admins can manage all teacher records
CREATE POLICY "Admins can manage teachers" ON teachers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE supabase_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Notices table policies
-- Public can view published notices
CREATE POLICY "Public can view published notices" ON notices
  FOR SELECT USING (is_published = true);

-- Authors can view their own notices
CREATE POLICY "Authors can view own notices" ON notices
  FOR SELECT USING (author_id IN (
    SELECT id FROM profiles WHERE supabase_user_id = auth.uid()
  ));

-- Admins and teachers can create notices
CREATE POLICY "Admins and teachers can create notices" ON notices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE supabase_user_id = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  );

-- Authors can update their own notices
CREATE POLICY "Authors can update own notices" ON notices
  FOR UPDATE USING (author_id IN (
    SELECT id FROM profiles WHERE supabase_user_id = auth.uid()
  ));

-- Admins can manage all notices
CREATE POLICY "Admins can manage all notices" ON notices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE supabase_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Media table policies
-- Public can view public media
CREATE POLICY "Public can view public media" ON media
  FOR SELECT USING (is_public = true);

-- Uploaders can view their own media
CREATE POLICY "Uploaders can view own media" ON media
  FOR SELECT USING (uploaded_by IN (
    SELECT id FROM profiles WHERE supabase_user_id = auth.uid()
  ));

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media" ON media
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    uploaded_by IN (
      SELECT id FROM profiles WHERE supabase_user_id = auth.uid()
    )
  );

-- Uploaders can update their own media
CREATE POLICY "Uploaders can update own media" ON media
  FOR UPDATE USING (uploaded_by IN (
    SELECT id FROM profiles WHERE supabase_user_id = auth.uid()
  ));

-- Uploaders can delete their own media
CREATE POLICY "Uploaders can delete own media" ON media
  FOR DELETE USING (uploaded_by IN (
    SELECT id FROM profiles WHERE supabase_user_id = auth.uid()
  ));

-- Admins can manage all media
CREATE POLICY "Admins can manage all media" ON media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE supabase_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create a function to check if user is admin (helper for policies)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE supabase_user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get current user's profile ID
CREATE OR REPLACE FUNCTION get_current_profile_id()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT id FROM profiles 
    WHERE supabase_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;