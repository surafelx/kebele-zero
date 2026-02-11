-- Create tables for Kebele Zero dashboard (FIXED VERSION)
-- Run this in Supabase SQL Editor

-- First, drop existing tables if needed (WARNING: deletes all data)
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS radio CASCADE;
-- DROP TABLE IF EXISTS videos CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS about CASCADE;
-- DROP TABLE IF EXISTS media CASCADE;
-- DROP TABLE IF EXISTS team_members CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS user_points CASCADE;
-- DROP TABLE IF EXISTS game_scores CASCADE;
-- DROP TABLE IF EXISTS forum_comments CASCADE;
-- DROP TABLE IF EXISTS forum_posts CASCADE;
-- DROP TABLE IF EXISTS about_content CASCADE;
-- DROP TABLE IF EXISTS user_levels CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Users table (custom users table linked to auth.users)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User levels table
CREATE TABLE user_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  max_points INTEGER,
  color TEXT DEFAULT '#007bff',
  icon TEXT DEFAULT '⭐',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default levels
INSERT INTO user_levels (level_name, min_points, max_points, color, icon) VALUES
('Beginner', 0, 99, '#808080', '⚪'),
('Intermediate', 100, 499, '#007bff', '🔵'),
('Advanced', 500, 1999, '#28a745', '🟢'),
('Expert', 2000, 4999, '#ffc107', '🟡'),
('Master', 5000, 9999, '#dc3545', '🔴'),
('Legend', 10000, NULL, '#6f42c1', '🟣');

-- About content table
CREATE TABLE about_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts table
CREATE TABLE forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum comments table
CREATE TABLE forum_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game scores table
CREATE TABLE game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User points table
CREATE TABLE user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  checkers_wins INTEGER DEFAULT 0,
  marbles_wins INTEGER DEFAULT 0,
  pool_wins INTEGER DEFAULT 0,
  foosball_wins INTEGER DEFAULT 0,
  current_level_id UUID REFERENCES user_levels(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media table
CREATE TABLE media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  alt_text TEXT,
  caption TEXT,
  media_url TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  category TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About table
CREATE TABLE about (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  mission TEXT,
  vision TEXT,
  values TEXT[],
  history TEXT,
  team JSONB,
  contact JSONB,
  images JSONB,
  stats JSONB,
  seo JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location JSONB NOT NULL,
  images JSONB,
  tickets JSONB,
  organizer JSONB,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  capacity INTEGER,
  age_restriction TEXT,
  requirements TEXT[],
  seo JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table (Media)
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  thumbnail JSONB,
  duration TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  channel JSONB,
  statistics JSONB,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  seo JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Radio table (Audio content)
CREATE TABLE radio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  duration TEXT,
  artist TEXT,
  album TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  statistics JSONB,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  seo JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ETB',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT UNIQUE,
  payment_intent_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
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

-- Create RLS Policies

-- Users: Self read, admin manage
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- User levels: Public read, admin manage
CREATE POLICY "Anyone can view user levels" ON user_levels FOR SELECT USING (true);
CREATE POLICY "Admins can manage user levels" ON user_levels FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- About content: Public read, admin manage
CREATE POLICY "Anyone can view about content" ON about_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage about content" ON about_content FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Forum posts: Public read, authenticated create, own edit/delete
CREATE POLICY "Anyone can view forum posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts" ON forum_posts FOR UPDATE USING (
  created_by = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can delete own posts" ON forum_posts FOR DELETE USING (
  created_by = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Forum comments: Public read, authenticated create, own edit/delete
CREATE POLICY "Anyone can view comments" ON forum_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON forum_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON forum_comments FOR UPDATE USING (
  created_by = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can delete own comments" ON forum_comments FOR DELETE USING (
  created_by = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Game scores: Public read, authenticated create, admin manage
CREATE POLICY "Anyone can view game scores" ON game_scores FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create scores" ON game_scores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage all scores" ON game_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- User points: Own read, admin manage
CREATE POLICY "Users can view own points" ON user_points FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage all points" ON user_points FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Products: Public read, admin manage
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Team members: Public read, admin manage
CREATE POLICY "Anyone can view team members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team members" ON team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Media: Public read, admin manage
CREATE POLICY "Anyone can view media" ON media FOR SELECT USING (true);
CREATE POLICY "Admins can manage media" ON media FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- About: Public read, admin manage
CREATE POLICY "Anyone can view about page" ON about FOR SELECT USING (true);
CREATE POLICY "Admins can manage about page" ON about FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Events: Public read, admin manage
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Videos: Public read, admin manage
CREATE POLICY "Anyone can view videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Admins can manage videos" ON videos FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Radio: Public read, admin manage
CREATE POLICY "Anyone can view radio" ON radio FOR SELECT USING (true);
CREATE POLICY "Admins can manage radio" ON radio FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Transactions: Own read, admin manage
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage transactions" ON transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Create index for better performance
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_media_category ON media(category);
CREATE INDEX idx_radio_category ON radio(category);

-- Insert sample admin user (you may need to update auth_user_id after signing up)
INSERT INTO users (email, username, role) VALUES 
('admin@kebele.com', 'Admin', 'admin'),
('demo@kebele.com', 'Demo User', 'user');

-- Insert sample about content
INSERT INTO about_content (section, title, content) VALUES
('hero', 'WELCOME TO KEBELE', 'Empowering Ethiopian communities through culture, commerce, and connection'),
('mission', 'OUR MISSION', 'To preserve and promote Ethiopian cultural heritage while fostering economic growth and community development.'),
('vision', 'OUR VISION', 'To become the leading digital hub connecting Ethiopians worldwide.'),
('story', 'OUR STORY', 'Founded in 2020, Kebele emerged from a vision to bridge the gap between traditional Ethiopian culture and modern digital platforms.');
