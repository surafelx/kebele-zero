-- Add missing columns to media table (run this if policies already exist)
ALTER TABLE media ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'general';

-- Add public read policies for tables that might not have them
-- These will only work if the tables exist and policies don't conflict

-- For about_content - ensure public read
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'about_content' AND policyname = 'Public read about_content'
    ) THEN
        CREATE POLICY "Public read about_content" ON about_content FOR SELECT USING (true);
    END IF;
END $$;

-- For media - ensure public read
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Public read media'
    ) THEN
        CREATE POLICY "Public read media" ON media FOR SELECT USING (true);
    END IF;
END $$;

-- For user_points - ensure public read
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_points' AND policyname = 'Public read user_points'
    ) THEN
        CREATE POLICY "Public read user_points" ON user_points FOR SELECT USING (true);
    END IF;
END $$;

-- For user_levels - ensure public read
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_levels' AND policyname = 'Public read user_levels'
    ) THEN
        CREATE POLICY "Public read user_levels" ON user_levels FOR SELECT USING (true);
    END IF;
END $$;

-- For users - ensure public read
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Public read users'
    ) THEN
        CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
    END IF;
END $$;
