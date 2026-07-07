# Remit to Revenue Setup Guide

## 1. Create Supabase Project
1. Go to https://app.supabase.com
2. Create a new project
3. Copy your **Project URL** and **Anon Key** to `.env.local`

## 2. Create Database Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- transactions and savings_log reference Supabase's built-in auth.users directly —
-- no separate custom users table needed for v1, since Supabase auth already
-- handles identity (email, id). Add a profile table later if phone/name fields
-- are needed beyond what auth.users provides.

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_received INT NOT NULL,
  sender_name TEXT NOT NULL,
  received_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, received_at, sender_name)
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_received_at ON transactions(received_at DESC);

-- Create savings_log table
CREATE TABLE savings_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_saved INT NOT NULL,
  saved_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(transaction_id)
);

CREATE INDEX idx_savings_log_user_id ON savings_log(user_id);
```

### If you already created the tables with the old schema

Run this migration instead of recreating tables from scratch:

```sql
ALTER TABLE transactions DROP CONSTRAINT transactions_user_id_fkey;
ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE savings_log DROP CONSTRAINT savings_log_user_id_fkey;
ALTER TABLE savings_log ADD CONSTRAINT savings_log_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DROP TABLE IF EXISTS users; -- no longer referenced, auth.users covers identity
```

## 3. Weekly Summary Feature

Run `supabase/weekly_summary.sql` in the Supabase SQL Editor. It enables Row
Level Security on `transactions` and `savings_log` (own-row policies only —
these were left off in v1) and creates `get_weekly_summary(user_id uuid)`,
a Postgres function returning `total_received`, `total_saved`,
`save_rate_percent`, and `current_streak` for the trailing 7 days.

## 4. Update .env.local

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Install & Run

```bash
npm install
npm run dev
```

The app will open at http://localhost:5173

## 6. Test Flow

1. Sign up with an email
2. Add a remittance (e.g., from "Father", amount Rs. 5000)
3. Click "Save 10%" to log savings
4. Check the stats dashboard for totals and streak

## Schema Notes

- Amounts are stored in **paisa** (NPR paisa; Rs. 1 = 100 paisa) to avoid float precision issues
- Streak counts consecutive transactions with a `savings_log` entry
- Each transaction can only be saved once (UNIQUE constraint)
- The weekly summary's `current_streak` uses the same consecutive-transaction
  definition, scoped to transactions received in the trailing 7 days

---

See REMITTANCE_PLAN.md for the full technical spec.
