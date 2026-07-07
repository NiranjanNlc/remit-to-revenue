# Test Scenarios

Concrete cases that simulate real connectivity patterns. Each should exist as
an actual automated or manual test before offline-related code is considered
complete.

## 1. Network drops after submission, before response

Queue the operation, show "pending." On the resulting timeout, the sync
engine retries with the **same** idempotency key (outcome was unknown). The
server deduplicates the retry against the original request and returns the
original success response. UI updates to confirmed. No duplicate transaction
is created.

## 2. Fully offline at submission time

User taps send while offline. The operation is queued immediately with
"pending" status and the "saved offline" UI state (see
`ui-copy-examples.md`). When connectivity returns, the sync engine processes
the queue in order and the transaction succeeds.

## 3. Duplicate tap on send button

First tap queues the operation and disables the send button immediately. A
second tap is ignored at the UI layer. As a defense-in-depth check: if a
second submission somehow reaches the queue anyway (e.g. from a second
browser tab), the idempotency key ensures the server processes it at most
once.

## 4. App restart mid-sync

The app is killed or crashes while an operation is "in-flight." On restart,
the pending-operations queue is read from local persistent storage (still
encrypted per Step 1), and the sync engine resumes processing from the first
pending item, without losing any queued operations.

## 5. Server returns 5xx repeatedly

After the configured maximum retry count, the operation is marked "failed."
The user sees a clear, actionable error and a manual "Retry" button. Since
the original outcome is still unknown, retrying reuses the same idempotency
key - unless the rate validity window has expired during the retry period, in
which case the "rate expired" flow (Step 1b) takes precedence and requires
re-confirmation with a new key.

## 6. Rate expires while queued

A transaction is queued successfully but connectivity doesn't return until
after the rate validity window has passed. On eventual sync attempt, the
operation is marked "rate expired" rather than silently executed at the
locked (now stale) rate. The user is shown the new rate and must explicitly
re-confirm, generating a new idempotency key for the re-confirmed transfer.
