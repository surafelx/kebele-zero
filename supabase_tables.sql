-- Create tables for Kebele Zero dashboard

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
  created_by UUID REFERENCES auth.users(id) NULL,
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
  created_by UUID REFERENCES auth.users(id) NULL,
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

-- Enable Row Level Security
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

-- Create policies (adjust as needed for your auth setup)
-- For now, allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users on users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on user_levels" ON user_levels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on about_content" ON about_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on forum_posts" ON forum_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on forum_comments" ON forum_comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on game_scores" ON game_scores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on user_points" ON user_points FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on team_members" ON team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on media" ON media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on about" ON about FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on events" ON events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on videos" ON videos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on radio" ON radio FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on transactions" ON transactions FOR ALL USING (auth.role() = 'authenticated');