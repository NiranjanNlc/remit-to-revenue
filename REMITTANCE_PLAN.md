# Remit to Revenue + Savings App — Implementation Plan

## Project Brief
Nepali migrant worker family members track incoming remittances and build saving habits. Demo only — 3 Supabase tables, one "Save 10%?" button, basic streak counting.

---

## 1. Database Schema

### Table: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

### Table: `transactions`
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_received INT NOT NULL, -- in paisa/cents (no floats)
  sender_name TEXT NOT NULL,
  received_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, received_at, sender_name) -- prevent duplicates
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_received_at ON transactions(received_at DESC);
```

### Table: `savings_log`
```sql
CREATE TABLE savings_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_saved INT NOT NULL, -- 10% of transaction or custom
  saved_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(transaction_id) -- user can only save once per transaction
);

CREATE INDEX idx_savings_log_user_id ON savings_log(user_id);
```

---

## 2. Data Contracts (Pre/Postconditions)

### Operation: Record Transaction
**Preconditions:**
- User is authenticated (Supabase auth)
- `amount_received > 0`
- `sender_name` is not empty

**Postconditions:**
- New row in `transactions` table
- Returns transaction ID and received amount
- Failure modes: FK violation (invalid user_id), UNIQUE constraint violation (duplicate within same second + sender)

### Operation: Tap "Save 10%?"
**Preconditions:**
- User is authenticated
- Transaction exists and belongs to user
- No existing `savings_log` row for this transaction_id

**Postconditions:**
- New row in `savings_log` with amount_saved = ceil(transaction.amount_received * 0.1)
- User's total saved is updated (derived from SUM of savings_log)
- Failure modes: FK violation, UNIQUE constraint on transaction_id

### Operation: Calculate Streak
**Preconditions:**
- User is authenticated

**Postconditions:**
- Count consecutive transactions (ordered by received_at DESC) where savings_log entry exists
- Streak resets at first transaction with no savings_log entry
- Metrics: `current_streak`, `total_transactions`, `total_saved`, `total_received`

---

## 3. API Surface (Supabase Client SDK)

| Operation | Method | Call | Returns |
|-----------|--------|------|---------|
| Login | `auth.signInWithPassword()` | Email + password (or OTP placeholder) | Session token |
| Record transaction | `from('transactions').insert()` | {user_id, amount_received, sender_name} | {id, received_at} |
| Get transactions | `from('transactions').select()` | WHERE user_id = $1 ORDER BY received_at DESC | Array of transactions |
| Tap save | `from('savings_log').insert()` | {transaction_id, user_id, amount_saved} | {id, saved_at} |
| Get stats | `from('transactions').select(), from('savings_log').select()` | WHERE user_id = $1 | Rows for aggregation |
| Calculate streak | Client-side logic | Sort transactions, count consecutive with savings | Number |

---

## 4. React Component Tree

```
<App>
  ├── <Auth> (login screen, phone/password input)
  ├── <Dashboard> (authenticated)
  │   ├── <Header> (user name, logout)
  │   ├── <Stats> (total received, total saved, %, streak)
  │   ├── <TransactionList>
  │   │   ├── <TransactionCard> (repeating)
  │   │   │   ├── <TransactionDetail> (sender, amount, date)
  │   │   │   ├── <SaveButton> / <Saved> (conditional)
  │   │   │   └── <SaveAmount> (10% or custom, display only)
  │   └── <AddTransaction> (form: sender + amount)
```

**State ownership:**
- `user` → App (Supabase auth state)
- `transactions` → Dashboard (fetched from DB)
- `savingsLog` → Dashboard (fetched from DB)
- `stats` (derived) → Stats component (calculated from transactions + savingsLog)
- `streak` (derived) → Stats component (calculated client-side)
- `loading`, `error` → local per component

---

## 5. State Management & Effects

### In App
```javascript
useEffect(() => {
  // On mount, check auth
  supabase.auth.onAuthStateChange((user) => setUser(user));
}, []);
```

### In Dashboard
```javascript
useEffect(() => {
  // Fetch transactions
  supabase.from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('received_at', { ascending: false })
    .then(data => setTransactions(data));
}, [user.id]);

useEffect(() => {
  // Fetch savings log
  supabase.from('savings_log')
    .select('*')
    .eq('user_id', user.id)
    .then(data => setSavingsLog(data));
}, [user.id]);

useEffect(() => {
  // Recalculate stats
  const totalReceived = sum(transactions.map(t => t.amount_received));
  const totalSaved = sum(savingsLog.map(s => s.amount_saved));
  const streak = calculateStreak(transactions, savingsLog);
  setStats({ totalReceived, totalSaved, streak });
}, [transactions, savingsLog]);
```

### In TransactionCard (on Save tap)
```javascript
const handleSave = async () => {
  const amountSaved = Math.ceil(transaction.amount_received * 0.1);
  await supabase.from('savings_log').insert({
    transaction_id: transaction.id,
    user_id: user.id,
    amount_saved
  });
  // Refetch savingsLog → triggers stats recalc
  setSavingsLog(prev => [...prev, { transaction_id: transaction.id, amount_saved }]);
};
```

---

## 6. Critical Paths

### Path 1: User Logs In
1. User enters phone + password → `auth.signInWithPassword()`
2. Supabase returns session
3. App sets `user` state → triggers Dashboard render
4. Dashboard's useEffect fires → fetch transactions + savings_log
5. Display dashboard with empty list or existing transactions

### Path 2: Transaction Arrives
1. User taps "Add Transaction"
2. Fills sender + amount → submits form
3. `transactions.insert({user_id, amount_received, sender_name})`
4. Card appears at top of list (most recent)
5. "Save 10%?" button visible, clickable

### Path 3: User Taps "Save"
1. User taps "Save 10%?" on a transaction card
2. Calculate amount_saved = ceil(amount_received * 0.1)
3. `savings_log.insert({transaction_id, user_id, amount_saved})`
4. On success: button changes to "Saved ✓" (disabled)
5. Stats recalculate → streak may increment if this was consecutive
6. Notify user (toast) with saved amount

### Path 4: Streak Updates
1. After each save, client sorts transactions by received_at DESC
2. Loop: if `savings_log[transaction_id]` exists, increment streak; else break
3. Display streak count in Stats component
4. If user skips a transaction, streak resets to 0

---

## 7. Verification Checklist

### Schema & Constraints
- [ ] All tables created with correct types (INT for amounts, not FLOAT)
- [ ] UNIQUE constraint on transactions(user_id, received_at, sender_name) enforced
- [ ] UNIQUE constraint on savings_log(transaction_id) enforced
- [ ] FK relationships cascade on delete
- [ ] Indexes exist on user_id and received_at

### Auth Flow
- [ ] Login works with Supabase defaults (email/password or phone/OTP)
- [ ] Logout clears session
- [ ] Unauthenticated users can't see dashboard
- [ ] RLS off for v1 (data is not sensitive in demo)

### Transaction Recording
- [ ] Add Transaction form submits to Supabase
- [ ] New transaction appears at top of list
- [ ] Duplicate-prevention works (UNIQUE constraint blocks re-entry)
- [ ] Amount displays correctly (no float precision errors)

### Save Flow
- [ ] "Save 10%?" button appears on unsaved transactions
- [ ] Tapping Save inserts into savings_log
- [ ] Button changes to "Saved ✓" immediately
- [ ] Second tap is blocked (UNIQUE constraint or UI disables)
- [ ] Amount saved = ceil(amount_received * 0.1)

### Stats & Streak
- [ ] Total Received = SUM(transactions.amount_received)
- [ ] Total Saved = SUM(savings_log.amount_saved)
- [ ] % Saved = (Total Saved / Total Received) * 100
- [ ] Streak counts consecutive transactions with savings_log entries
- [ ] Streak resets if a transaction has no savings_log entry
- [ ] Stats update immediately after tapping Save

### Error Handling
- [ ] Network failure shows error toast, retry available
- [ ] Constraint violation (UNIQUE, FK) shows user-friendly message
- [ ] Empty state when no transactions exist
- [ ] Loading spinners while fetching

### Multi-Transaction Flow
- [ ] Enter 5 transactions, save on all 5 → streak = 5, % = 100%
- [ ] Skip the 3rd save → streak resets to 0 after 2nd transaction
- [ ] Create new transaction, save → streak = 1 again
- [ ] Stats match manual calculation

---

## 8. Explicitly NOT in v1

- Real money movement or payment gateways
- Loans, credit, or debt tracking
- SMS notifications or multi-language UI
- Charts, category breakdowns, or budget advice
- Custom server logic (Supabase auto-API only)
- Advanced RLS policies
- Data export or recurring payment setup

---

## Success Metric

**% of transactions where the user taps "Save"** — track in the dashboard or via Supabase analytics query:

```sql
SELECT 
  COUNT(DISTINCT transaction_id) as transactions_with_saves,
  COUNT(DISTINCT u.id) as total_transactions,
  ROUND(100.0 * COUNT(DISTINCT transaction_id) / COUNT(DISTINCT u.id)) as save_percentage
FROM transactions t
LEFT JOIN savings_log s ON t.id = s.transaction_id;
```

---

## Tech Stack Summary

- **Frontend:** React (or plain JS + DOM)
- **Backend:** Supabase (PostgreSQL, Auth, client SDK)
- **Hosting:** Vercel or Netlify (static React) + Supabase managed
- **No custom API, no CI/CD for now**

---

Ready to build. Start with schema → test inserts → scaffold React components → wire up Supabase calls.
