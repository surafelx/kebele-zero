-- Just add missing columns (skip policies since they already exist)
ALTER TABLE media ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'general';
