-- Seed data for Farid Cadet Academy
-- Run this after schema.sql to populate initial data

-- Insert sample notices (Bangla)
INSERT INTO notices (title, body, language, is_published, created_at) VALUES
('ভর্তি বিজ্ঞপ্তি ২০২৪', 'ফরিদ ক্যাডেট একাডেমিতে ২০২৪ সালের জন্য ভর্তি চলছে। আগ্রহী শিক্ষার্থীরা যোগাযোগ করুন।', 'bn', true, now() - interval '2 days'),
('পরীক্ষার সময়সূচী', 'আগামী সপ্তাহে মাসিক পরীক্ষা অনুষ্ঠিত হবে। সময়সূচী দেখুন।', 'bn', true, now() - interval '1 day'),
('বিশেষ ক্লাস', 'ক্যাডেট কলেজ প্রস্তুতির জন্য বিশেষ ক্লাস শুরু হচ্ছে।', 'bn', true, now());

-- Insert sample notices (English)
INSERT INTO notices (title, body, language, is_published, created_at) VALUES
('Admission Notice 2024', 'Admission is ongoing at Farid Cadet Academy for 2024. Interested students please contact us.', 'en', true, now() - interval '2 days'),
('Exam Schedule', 'Monthly examination will be held next week. Check the schedule.', 'en', true, now() - interval '1 day'),
('Special Classes', 'Special classes for Cadet College preparation are starting.', 'en', true, now());

-- Insert sample media entries
INSERT INTO media (title, description, file_path, file_type, file_size, is_public, created_at) VALUES
('Academy Building', 'Main building of Farid Cadet Academy', '/images/academy-building.jpg', 'image/jpeg', 1024000, true, now()),
('Classroom', 'Modern classroom facilities', '/images/classroom.jpg', 'image/jpeg', 856000, true, now()),
('Library', 'Well-equipped library', '/images/library.jpg', 'image/jpeg', 945000, true, now()),
('Sports Ground', 'Academy sports facilities', '/images/sports-ground.jpg', 'image/jpeg', 1200000, true, now());