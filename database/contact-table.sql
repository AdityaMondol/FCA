-- Contact submissions table for storing contact form submissions
-- Run this in Supabase SQL Editor after the main schema

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'resolved')),
  submitted_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON contact_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_submissions
-- Admins can view all submissions
CREATE POLICY "Admins can view all contact submissions" ON contact_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE supabase_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update submission status
CREATE POLICY "Admins can update contact submissions" ON contact_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE supabase_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Service role can insert submissions (for public contact form)
CREATE POLICY "Service role can insert contact submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);