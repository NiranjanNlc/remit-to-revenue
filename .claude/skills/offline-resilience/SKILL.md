---
name: offline-resilience
description: Use whenever designing, implementing, or reviewing code that performs a data-mutating operation (create, update, delete) in an app where users may have intermittent, slow, or absent network connectivity - form submissions, transaction initiation, balance updates, or any workflow spanning multiple network-dependent steps. Fires even on operations that seem unlikely to fail, such as a routine balance refresh, since the trigger is deliberately broad to fight under-firing - the most damaging bugs (duplicate transactions, silent data loss, a UI that lies about success) come from treating a network call as reliable by default. Covers idempotency keys, local persistence and queuing, retry/backoff, exchange-rate staleness across a queued transaction, encryption of locally queued PII, and the pending/confirmed/offline UI states. Requires a project compliance reference for transfer limits and rate-validity windows.
---

# Offline-First Architecture and Data Integrity

## Why this exists

Intermittent connectivity is normal, not exceptional, for the people this app
serves. Code that assumes a single `fetch()` call is sufficient will produce
duplicate charges, transfers that appear sent but never arrive, or a UI that
misleads the user about whether their money actually moved. This procedure
applies to every operation that mutates remote state.

## Step 0: Classify the operation and set idempotency rules

Every mutation falls into one of three categories:

- **Payment/transfer**: at-most-once execution. Duplicate submission is
  catastrophic. The client generates a UUID idempotency key before any
  network call; it travels with every attempt.
  - Retry after a **confirmed failure** (server returned a definitive
    rejection - insufficient funds, invalid recipient): generate a **new**
    key. This is a distinct logical submission.
  - Retry after an **unknown outcome** (timeout, 5xx): reuse the **same**
    key, so the server can deduplicate safely.
  - User edits the payment and resubmits: generate a **new** key.
  - The server must deduplicate by key for at least the duration of the rate
    validity window (Step 1b).
- **Balance check / read-modify-write**: retry freely, but the UI must show
  staleness. Optimistic updates are clearly marked as estimates until
  confirmed.
- **Profile/recipient update**: eventual consistency is acceptable. Conflicts
  use last-write-wins on server timestamp, or an explicit merge prompt for
  critical fields.

Do not leave the retry-key choice as an open question inside a test case or
comment ("reuse the key, or maybe generate a new one - decide later"). It is
a rule, stated here, applied consistently.

## Step 1: Design local persistence, with encryption at rest

Every mutation is written to local storage **before** the network attempt, in
a pending-operations record with at minimum: `id`, `idempotencyKey`, `type`,
`payload`, `status` (pending / in-flight / completed / failed), `createdAt`,
`lastAttemptAt`, `retryCount`, `error`.

**Encryption requirement**: the payload contains PII (recipient name, phone,
amount) and may sit on a device shared among family members. Encrypt the
payload before writing to disk using an **app-level key stored in the
platform's secure keystore/keychain** - not a key derived from a user PIN or
biometric. This is a deliberate choice, not an oversight: a user-secret-derived
key would make automatic background sync impossible (there is no user present
to authenticate when connectivity returns), which breaks this skill's core
guarantee that a queued transfer sends itself once online.

This design has an explicit, accepted limit: it protects against **offline
file inspection** (someone browsing the device's storage while the app isn't
running), but not against **a person with the unlocked device in hand who
opens the app itself**. That second threat is closed by
`vulnerable-user-ui-safety`'s cold-launch authentication requirement - see
`references/cross-skill-boundaries.md` for the full handoff.

If platform keystore support is genuinely unavailable, the only acceptable
fallback is to clear the queue when the app backgrounds and tell the user
offline queuing is disabled for this session. State plainly that this removes
the automatic-delivery guarantee; it is a last resort, not a design target.

## Step 1b: Lock the exchange rate at queue time

When a transfer is queued, capture the exchange rate, computed receive
amount, and a timestamp, and store them in the encrypted payload alongside
the operation. The server must honor this locked rate for the **rate
validity window** defined in the compliance file (e.g. 24 hours).

- If the sync engine executes within the window, the server uses the locked
  rate.
- If the window expires while still pending, do **not** silently re-quote and
  retry. Mark the operation "rate expired," notify the user in plain
  language that the rate has changed, and require them to review and
  re-confirm the new amount - generating a new idempotency key for the
  re-confirmed transfer.

This exists because the sender's trust rests on the number they approved
being the number the recipient gets. A silent re-price between queue time and
execution time breaks that guarantee just as surely as an arithmetic bug
would, even though the calculation itself (handled by
`financial-calc-verification`) was correct at the moment it ran.

## Step 2: Implement the sync engine with controlled retry

Processes the queue one operation at a time.

- **Network detection**: use `navigator.onLine` plus a periodic lightweight
  health-check request. `onLine` alone produces false positives on some
  networks; do not rely on it exclusively.
- **Execution**: mark "in-flight," send with the idempotency key, await
  response.
- **Success (2xx)**: mark "completed," update the UI, remove from the active
  queue.
- **Client error (4xx, non-retryable)**: mark "failed," surface the specific
  reason to the user, do not auto-retry. The user must edit and resubmit
  (new key).
- **Server error (5xx) / timeout**: keep "pending," increment retry count,
  exponential backoff (`min(2^retryCount * baseDelay, maxDelay)`). After a
  configured max (e.g. 5 attempts), mark "failed" with a manual retry option
  that reuses the same key (outcome still unknown) — unless the rate validity
  window has expired, in which case the Step 1b re-confirmation flow applies
  instead.
- **Conflict (409)**: if the server already processed the payment (duplicate
  key), treat as success. Otherwise handle per operation type as in Step 0.

## Step 3: Design the user-facing states

Every relevant screen explicitly handles three states: online-confirmed,
online-pending, offline. Never show a success confirmation the server hasn't
acknowledged.

- **Confirmation screen**: on submit, show "Processing…" with the idempotency
  key visible for support reference; disable the button to prevent
  double-tap. If offline at submission, queue immediately and show
  "Saved. Will send when you're back online" with an estimated retry time.
- **Transaction history**: pending items get distinct visual treatment (e.g.
  a clock icon, italicized amount). Never combine pending and confirmed
  amounts into one "available balance" figure.
- **Error messages**: plain language in the user's language, describing what
  happened and what happens next - never a raw status code or stack trace.
  See `references/ui-copy-examples.md`.

## Step 4: Idempotency and duplicate-prevention checklist

Before payment-related code is considered complete, verify:

- The idempotency key is generated exactly once per logical submission.
- It is included in every request for that operation, every attempt.
- The server deduplicates by key for at least the rate validity window.
- A new key is generated on confirmed failure or user edit; the same key is
  reused on unknown-outcome retry.
- A pending operation is never deleted from local storage until a definitive
  success or non-retryable failure response arrives.
- A stray duplicate enqueue (e.g. from a second tab) cannot cause double
  execution, because the idempotency key is the same and the server
  deduplicates by it.

## Step 5: Conflict resolution for shared-account scenarios

- Profile edits: last-write-wins by server timestamp; show a non-blocking
  notice if the user's own recent edit was overwritten by another family
  member's edit.
- Transactions: each is independent via its idempotency key; a true
  double-submission conflict is prevented by per-device/session key
  generation, not by any transaction-level locking.

## Step 6: Test scenarios

See `references/test-scenarios.md` for the full set (network drop mid-flight,
fully offline queueing, duplicate tap, app restart mid-sync, repeated 5xx,
and rate expiry while queued).

## Step 7: Cross-check with compliance

Before retrying any payment, re-validate the amount against current transfer
limits from the compliance file - a pending transfer that sits queued for
days could, in principle, collide with a corridor ceiling by the time it
executes. If a limit is exceeded, fail with a clear explanation; never
silently drop the operation.
