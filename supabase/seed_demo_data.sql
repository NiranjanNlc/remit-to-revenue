-- Demo seed data for the weekly summary feature.
--
-- Attaches to the first signed-up account (auth.users ordered by
-- created_at). If you have multiple test accounts and want a specific one,
-- replace the SELECT below with:
--   SELECT id INTO demo_user_id FROM auth.users WHERE email = 'you@example.com';
--
-- Safe to run once. Re-running adds a second copy of this demo data (the
-- UNIQUE(user_id, received_at, sender_name) constraint won't catch repeats
-- since received_at is computed from now() at the time you run it).
--
-- Mix: 7 transactions inside the trailing-7-day window (one skipped save to
-- show the streak breaking), plus 2 older transactions outside the window
-- to show the weekly summary and the all-time Stats card diverge.

DO $$
DECLARE
  demo_user_id uuid;
  txn_id uuid;
  rec record;
BEGIN
  SELECT id INTO demo_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in auth.users -- sign up in the app first, then re-run this script.';
  END IF;

  FOR rec IN
    SELECT * FROM (VALUES
      -- days_ago, sender_name,  amount_rs, saved
      (0,  'Father',  6000, true),
      (1,  'Mother',  4500, true),
      (2,  'Brother', 7000, true),
      (3,  'Uncle',   3000, true),
      (4,  'Father',  5000, false),
      (5,  'Mother',  4000, true),
      (6,  'Brother', 6500, true),
      (10, 'Father',  8000, true),
      (12, 'Uncle',   3500, false)
    ) AS t(days_ago, sender_name, amount_rs, saved)
  LOOP
    INSERT INTO transactions (user_id, amount_received, sender_name, received_at)
    VALUES (
      demo_user_id,
      rec.amount_rs * 100,
      rec.sender_name,
      now() - (rec.days_ago || ' days')::interval
    )
    RETURNING id INTO txn_id;

    IF rec.saved THEN
      INSERT INTO savings_log (transaction_id, user_id, amount_saved, saved_at)
      VALUES (
        txn_id,
        demo_user_id,
        CEIL(rec.amount_rs * 100 * 0.1)::int,
        now() - (rec.days_ago || ' days')::interval
      );
    END IF;
  END LOOP;
END $$;

-- NOTE: don't verify by calling get_weekly_summary(...) directly here. The
-- SQL Editor runs as the `postgres` role with no JWT session, so auth.uid()
-- is NULL and the function's own check (user_id IS DISTINCT FROM auth.uid())
-- will reject it -- that's the defense-in-depth working as intended, not a
-- bug. Verify by reloading the app instead, or with the plain query below.

-- Expected trailing-7-day totals after this runs:
--   total_received = Rs. 36,000  (3,600,000 paisa)
--   total_saved    = Rs. 3,100   (310,000 paisa)
--   save_rate      ~ 9%
--   current_streak = 4  (today back through 3 days ago, breaks at day 4)
SELECT
  t.sender_name,
  t.amount_received / 100.0 AS amount_rs,
  t.received_at,
  (s.transaction_id IS NOT NULL) AS saved
FROM transactions t
LEFT JOIN savings_log s ON s.transaction_id = t.id
WHERE t.user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
ORDER BY t.received_at DESC;
