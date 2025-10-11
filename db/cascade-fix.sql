-- Fix CASCADE DELETE for Account Deletion
-- Run this in Supabase SQL Editor
-- This ensures that when a user is deleted, all their related data is automatically removed

-- Drop existing foreign key constraints and recreate them with CASCADE DELETE

-- 1. Fix notices table - created_by foreign key
ALTER TABLE notices 
DROP CONSTRAINT IF EXISTS notices_created_by_fkey;

ALTER TABLE notices 
ADD CONSTRAINT notices_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 2. Fix media table - uploaded_by foreign key
ALTER TABLE media 
DROP CONSTRAINT IF EXISTS media_uploaded_by_fkey;

ALTER TABLE media 
ADD CONSTRAINT media_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 3. Verify teacher_profiles already has CASCADE (it should from schema)
-- If not, fix it:
ALTER TABLE teacher_profiles 
DROP CONSTRAINT IF EXISTS teacher_profiles_user_id_fkey;

ALTER TABLE teacher_profiles 
ADD CONSTRAINT teacher_profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Verify the constraints are correctly set
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('notices', 'media', 'teacher_profiles')
ORDER BY tc.table_name;
