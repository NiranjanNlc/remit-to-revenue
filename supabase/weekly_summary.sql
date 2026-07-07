-- Weekly summary feature: total received, total saved, save rate %, and
-- current streak, all computed over the trailing 7 days.
--
-- Run this in the Supabase SQL Editor after the tables from SETUP.md exist.

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- REMITTANCE_PLAN.md shipped v1 with "RLS off for v1" (demo-only decision).
-- get_weekly_summary() is SECURITY INVOKER, so it only returns correct,
-- caller-scoped data if RLS is actually enforced on the underlying tables.
-- Enable it now with owner-only policies.
-- ---------------------------------------------------------------------------

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_log ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY has no IF NOT EXISTS in Postgres, so drop-then-create to
-- keep this script safe to re-run.
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own savings" ON savings_log;
CREATE POLICY "Users can view own savings" ON savings_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own savings" ON savings_log;
CREATE POLICY "Users can insert own savings" ON savings_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- get_weekly_summary(user_id)
--
-- Window: transactions with received_at >= now() - 7 days. A transaction's
-- save is included via its savings_log row regardless of when the save was
-- tapped, matching the existing all-time logic in Stats.jsx (which sums
-- savings_log unconditionally, keyed off the transaction).
--
-- current_streak reuses the app's existing streak definition (consecutive
-- transactions, most-recent-first, with a savings_log entry, breaking at the
-- first gap) scoped to this 7-day window.
--
-- Security: SECURITY INVOKER (default) so the caller's own role and RLS
-- policies apply to every query inside. The user_id parameter is checked
-- against auth.uid() as defense-in-depth -- even if RLS were ever disabled
-- or misconfigured on these tables, this function still can't be used to
-- read another user's data.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_weekly_summary(user_id uuid)
RETURNS TABLE (
  total_received bigint,
  total_saved bigint,
  save_rate_percent numeric,
  current_streak int
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  window_start timestamp := now() - interval '7 days';
BEGIN
  IF user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'user_id must match the authenticated user';
  END IF;

  RETURN QUERY
  WITH window_txns AS (
    SELECT
      t.id,
      t.amount_received,
      t.received_at,
      s.amount_saved,
      (s.transaction_id IS NOT NULL) AS is_saved
    FROM transactions t
    LEFT JOIN savings_log s
      ON s.transaction_id = t.id AND s.user_id = t.user_id
    WHERE t.user_id = get_weekly_summary.user_id
      AND t.received_at >= window_start
  ),
  ordered AS (
    SELECT w.*, ROW_NUMBER() OVER (ORDER BY w.received_at DESC) AS rn
    FROM window_txns w
  ),
  first_gap AS (
    -- Most-recent-first: the first row that has no save. Everything more
    -- recent than that row is the unbroken current streak.
    SELECT MIN(rn) AS gap_rn FROM ordered WHERE NOT is_saved
  )
  SELECT
    COALESCE(SUM(w.amount_received), 0)::bigint AS total_received,
    COALESCE(SUM(w.amount_saved), 0)::bigint AS total_saved,
    CASE
      WHEN COALESCE(SUM(w.amount_received), 0) = 0 THEN 0
      ELSE ROUND(100.0 * COALESCE(SUM(w.amount_saved), 0) / SUM(w.amount_received))
    END AS save_rate_percent,
    COALESCE(
      (SELECT gap_rn - 1 FROM first_gap),
      (SELECT COUNT(*) FROM ordered)
    )::int AS current_streak
  FROM window_txns w;
END;
$$;

-- Only authenticated users may call this; anon (unauthenticated) cannot.
REVOKE EXECUTE ON FUNCTION get_weekly_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_weekly_summary(uuid) TO authenticated;
