-- RLS Policies for Kebele Zero
-- Run this SQL to fix RLS issues

-- Enable Row Level Security (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow all operations for authenticated users on users" ON users;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on user_levels" ON user_levels;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on about_content" ON about_content;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on forum_posts" ON forum_posts;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on forum_comments" ON forum_comments;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on game_scores" ON game_scores;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on user_points" ON user_points;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on products" ON products;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on team_members" ON team_members;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on media" ON media;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on about" ON about;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on events" ON events;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on videos" ON videos;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on radio" ON radio;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on social_links" ON social_links;

-- Allow public SELECT on read-only tables
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read user_levels" ON user_levels FOR SELECT USING (true);
CREATE POLICY "Public read about_content" ON about_content FOR SELECT USING (true);
CREATE POLICY "Public read media" ON media FOR SELECT USING (true);
CREATE POLICY "Public read about" ON about FOR SELECT USING (true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Public read radio" ON radio FOR SELECT USING (true);
CREATE POLICY "Public read social_links" ON social_links FOR SELECT USING (true);

-- Allow authenticated users all operations
CREATE POLICY "Authenticated all users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all user_levels" ON user_levels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all about_content" ON about_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all forum_posts" ON forum_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all forum_comments" ON forum_comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all game_scores" ON game_scores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all user_points" ON user_points FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all team_members" ON team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all media" ON media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all about" ON about FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all events" ON events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all videos" ON videos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all radio" ON radio FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all transactions" ON transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated all social_links" ON social_links FOR ALL USING (auth.role() = 'authenticated');

-- Add missing columns to media table (if not already added)
ALTER TABLE media ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'general';
