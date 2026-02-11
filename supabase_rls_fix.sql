-- Fix RLS Policies for Kebele Zero
-- Run this SQL to fix RLS issues

-- Add missing columns to media table first
ALTER TABLE media ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'general';

-- Fix user_points policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users on user_points" ON user_points;
CREATE POLICY "Public read user_points" ON user_points FOR SELECT USING (true);
CREATE POLICY "Authenticated all user_points" ON user_points FOR ALL USING (auth.role() = 'authenticated');

-- Fix user_levels policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users on user_levels" ON user_levels;
CREATE POLICY "Public read user_levels" ON user_levels FOR SELECT USING (true);
CREATE POLICY "Authenticated all user_levels" ON user_levels FOR ALL USING (auth.role() = 'authenticated');

-- Fix about_content policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users on about_content" ON about_content;
CREATE POLICY "Public read about_content" ON about_content FOR SELECT USING (true);
CREATE POLICY "Authenticated all about_content" ON about_content FOR ALL USING (auth.role() = 'authenticated');

-- Fix media policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users on media" ON media;
CREATE POLICY "Public read media" ON media FOR SELECT USING (true);
CREATE POLICY "Authenticated all media" ON media FOR ALL USING (auth.role() = 'authenticated');

-- Fix users policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users on users" ON users;
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Authenticated all users" ON users FOR ALL USING (auth.role() = 'authenticated');
