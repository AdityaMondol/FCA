-- Test queries to verify RLS policies are working
-- Run these after setting up RLS policies

-- Test 1: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'teachers', 'notices', 'media');

-- Test 2: List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 3: Check public access to published notices (should work without auth)
SELECT title, language, created_at 
FROM notices 
WHERE is_published = true 
LIMIT 5;

-- Test 4: Check public access to verified teachers (should work without auth)
SELECT t.bio, t.subjects, p.first_name, p.last_name
FROM teachers t
JOIN profiles p ON t.profile_id = p.id
WHERE t.verified = true
LIMIT 5;

-- Test 5: Check public access to public media (should work without auth)
SELECT title, file_type, created_at
FROM media 
WHERE is_public = true
LIMIT 5;

-- Test 6: Try to access private data (should return empty when not authenticated)
SELECT * FROM profiles LIMIT 1;

-- Test 7: Try to access unverified teachers (should return empty)
SELECT * FROM teachers WHERE verified = false LIMIT 1;

-- Test 8: Try to access unpublished notices (should return empty)
SELECT * FROM notices WHERE is_published = false LIMIT 1;