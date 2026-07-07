-- Savings Goals: track user goals with progress
--
-- Run this in the Supabase SQL Editor after weekly_summary.sql (which enables RLS).

-- ---------------------------------------------------------------------------
-- goals table
-- ---------------------------------------------------------------------------

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_amount INT NOT NULL,
  target_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_goals_user_id ON goals(user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goal" ON goals;
CREATE POLICY "Users can view own goal" ON goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own goal" ON goals;
CREATE POLICY "Users can insert own goal" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goal" ON goals;
CREATE POLICY "Users can update own goal" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own goal" ON goals;
CREATE POLICY "Users can delete own goal" ON goals
  FOR DELETE USING (auth.uid() = user_id);
