-- =============================================================================
-- KELELE ZERO - DATABASE SCHEMA AND QUERIES
-- =============================================================================
-- Copy and run these queries in your Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- SECTION 1: CREATE TABLES
-- =============================================================================

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
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
  created_by UUID REFERENCES auth.users(id),
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
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game scores table
CREATE TABLE game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User points table
CREATE TABLE user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
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

-- Products table (Souq)
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

-- About page table
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
  created_by UUID REFERENCES auth.users(id) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table (Media section)
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
  created_by UUID REFERENCES auth.users(id) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Radio/Audio table
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
  created_by UUID REFERENCES auth.users(id) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_id UUID REFERENCES events(id),
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

-- =============================================================================
-- SECTION 2: INSERT DEFAULT DATA
-- =============================================================================

-- Insert default user levels
INSERT INTO user_levels (level_name, min_points, max_points, color, icon) VALUES
('Beginner', 0, 99, '#808080', '⚪'),
('Intermediate', 100, 499, '#007bff', '🔵'),
('Advanced', 500, 1999, '#28a745', '🟢'),
('Expert', 2000, 4999, '#ffc107', '🟡'),
('Master', 5000, 9999, '#dc3545', '🔴'),
('Legend', 10000, NULL, '#6f42c1', '🟣');

-- Insert sample about content
INSERT INTO about_content (section, title, content) VALUES
('hero', 'Welcome to Kebele Zero', 'Your community hub for events, games, and connections.'),
('mission', 'Our Mission', 'To build a vibrant community that brings people together through shared experiences.'),
('vision', 'Our Vision', 'A world where communities thrive through connection, collaboration, and celebration.');

-- Insert sample team members
INSERT INTO team_members (name, role, bio, display_order) VALUES
('John Doe', 'Community Manager', 'Passionate about building communities.', 1),
('Jane Smith', 'Event Organizer', 'Creating memorable experiences for everyone.', 2);

-- =============================================================================
-- SECTION 3: CREATE INDEXES (For Performance)
-- =============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Forum indexes
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_created_by ON forum_posts(created_by);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at);
CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);

-- Game scores indexes
CREATE INDEX idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX idx_game_scores_game_type ON game_scores(game_type);
CREATE INDEX idx_game_scores_played_at ON game_scores(played_at);

-- User points indexes
CREATE INDEX idx_user_points_user_id ON user_points(user_id);

-- Events indexes
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_is_active ON events(is_active);

-- Videos indexes
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_is_featured ON videos(is_featured);

-- Radio indexes
CREATE INDEX idx_radio_category ON radio(category);
CREATE INDEX idx_radio_is_featured ON radio(is_featured);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- =============================================================================
-- SECTION 4: ENABLE ROW LEVEL SECURITY
-- =============================================================================

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

-- =============================================================================
-- SECTION 5: RLS POLICIES
-- =============================================================================

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Forum posts policies
CREATE POLICY "Anyone can view active posts" ON forum_posts FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts" ON forum_posts FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Admins can manage all posts" ON forum_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Forum comments policies
CREATE POLICY "Anyone can view active comments" ON forum_comments FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create comments" ON forum_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON forum_comments FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Admins can manage all comments" ON forum_comments FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Game scores policies
CREATE POLICY "Anyone can view game scores" ON game_scores FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create scores" ON game_scores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage all scores" ON game_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- User points policies
CREATE POLICY "Users can view own points" ON user_points FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Admins can manage all points" ON user_points FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Products policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Events policies
CREATE POLICY "Anyone can view active events" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Videos policies
CREATE POLICY "Anyone can view active videos" ON videos FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage videos" ON videos FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Radio policies
CREATE POLICY "Anyone can view active radio" ON radio FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage radio" ON radio FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage transactions" ON transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================================================
-- SECTION 6: USEFUL SQL QUERIES
-- =============================================================================

-- Get all users with their levels
SELECT 
  u.id, u.email, u.username, u.role, u.created_at,
  up.total_points, up.games_played,
  ul.level_name, ul.icon, ul.color
FROM users u
LEFT JOIN user_points up ON up.user_id = u.id::text
LEFT JOIN user_levels ul ON ul.id = up.current_level_id
ORDER BY up.total_points DESC NULLS LAST;

-- Get forum posts with comment count
SELECT 
  fp.*,
  u.username as author_name,
  COUNT(fc.id) as comment_count
FROM forum_posts fp
LEFT JOIN users u ON u.id = fp.created_by
LEFT JOIN forum_comments fc ON fc.post_id = fp.id
WHERE fp.is_active = true
GROUP BY fp.id, u.username
ORDER BY fp.created_at DESC;

-- Get user game statistics
SELECT 
  gs.user_id,
  COUNT(*) as total_games,
  SUM(CASE WHEN gs.result = 'win' THEN 1 ELSE 0 END) as total_wins,
  SUM(CASE WHEN gs.result = 'loss' THEN 1 ELSE 0 END) as total_losses,
  SUM(CASE WHEN gs.game_type = 'checkers' AND gs.result = 'win' THEN 1 ELSE 0 END) as checkers_wins,
  SUM(CASE WHEN gs.game_type = 'marbles' AND gs.result = 'win' THEN 1 ELSE 0 END) as marbles_wins,
  SUM(score) as total_score
FROM game_scores gs
GROUP BY gs.user_id
ORDER BY total_score DESC;

-- Get upcoming events
SELECT * FROM events 
WHERE is_active = true AND start_date > NOW()
ORDER BY start_date ASC
LIMIT 10;

-- Get total revenue by status
SELECT 
  status,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM transactions
GROUP BY status
ORDER BY status;

-- Get user's rank based on points
SELECT 
  COUNT(*) + 1 as rank
FROM user_points
WHERE total_points > (SELECT total_points FROM user_points WHERE user_id = 'TARGET_USER_ID');

-- Update user points after game
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_points (user_id, total_points, games_played, checkers_wins, marbles_wins, pool_wins)
  VALUES (
    NEW.user_id,
    COALESCE((SELECT total_points FROM user_points WHERE user_id = NEW.user_id), 0) + NEW.score,
    COALESCE((SELECT games_played FROM user_points WHERE user_id = NEW.user_id), 0) + 1,
    COALESCE((SELECT checkers_wins FROM user_points WHERE user_id = NEW.user_id), 0) + CASE WHEN NEW.game_type = 'checkers' AND NEW.result = 'win' THEN 1 ELSE 0 END,
    COALESCE((SELECT marbles_wins FROM user_points WHERE user_id = NEW.user_id), 0) + CASE WHEN NEW.game_type = 'marbles' AND NEW.result = 'win' THEN 1 ELSE 0 END,
    COALESCE((SELECT pool_wins FROM user_points WHERE user_id = NEW.user_id), 0) + CASE WHEN NEW.game_type = 'pool' AND NEW.result = 'win' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + NEW.score,
    games_played = user_points.games_played + 1,
    checkers_wins = user_points.checkers_wins + CASE WHEN NEW.game_type = 'checkers' AND NEW.result = 'win' THEN 1 ELSE 0 END,
    marbles_wins = user_points.marbles_wins + CASE WHEN NEW.game_type = 'marbles' AND NEW.result = 'win' THEN 1 ELSE 0 END,
    pool_wins = user_points.pool_wins + CASE WHEN NEW.game_type = 'pool' AND NEW.result = 'win' THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update user points
CREATE TRIGGER trigger_update_user_points
AFTER INSERT ON game_scores
FOR EACH ROW
EXECUTE FUNCTION update_user_points();

-- Get top players leaderboard
SELECT 
  up.user_id,
  u.username,
  up.total_points,
  up.games_played,
  up.checkers_wins + up.marbles_wins + up.pool_wins as total_wins,
  ul.level_name,
  ul.icon
FROM user_points up
JOIN users u ON u.id = up.user_id::uuid
JOIN user_levels ul ON up.total_points BETWEEN ul.min_points AND COALESCE(ul.max_points, up.total_points + 1)
ORDER BY up.total_points DESC
LIMIT 20;

-- Get admin analytics summary
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM forum_posts WHERE is_active = true) as total_posts,
  (SELECT COUNT(*) FROM events WHERE is_active = true) as total_events,
  (SELECT COUNT(*) FROM game_scores) as total_games_played,
  (SELECT COUNT(*) FROM transactions WHERE status = 'completed') as completed_transactions,
  (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed') as total_revenue;
