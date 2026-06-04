-- ─────────────────────────────────────────────────────────────────
-- Payment Requests + Expanded Roles Migration
-- Run this in the Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- 1. Expand role enum on the users table
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
    CHECK (role IN ('user', 'moderator', 'admin'));

-- 2. Payment requests table
CREATE TABLE IF NOT EXISTS payment_requests (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email       TEXT NOT NULL,
  user_name        TEXT NOT NULL,
  item_type        TEXT NOT NULL CHECK (item_type IN ('event', 'product')),
  item_id          TEXT NOT NULL,
  item_name        TEXT NOT NULL,
  item_price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  quantity         INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_amount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method   TEXT NOT NULL DEFAULT 'bank_transfer'
                     CHECK (payment_method IN ('bank_transfer', 'cash', 'mobile_money')),
  notes            TEXT DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes      TEXT DEFAULT '',
  reviewed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMP WITH TIME ZONE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id   ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status    ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_item_type ON payment_requests(item_type);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created   ON payment_requests(created_at DESC);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_requests_updated_at
  BEFORE UPDATE ON payment_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Row Level Security
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Users can see their own requests
CREATE POLICY "users_view_own_requests" ON payment_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create requests
CREATE POLICY "users_create_requests" ON payment_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins and moderators can see all requests
CREATE POLICY "staff_view_all_requests" ON payment_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'moderator')
    )
  );

-- Admins and moderators can update (approve/reject) requests
CREATE POLICY "staff_update_requests" ON payment_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'moderator')
    )
  );

-- Admins can delete requests
CREATE POLICY "admin_delete_requests" ON payment_requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );
