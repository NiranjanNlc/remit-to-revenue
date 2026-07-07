# Cross-Skill Boundaries

This skill does not operate in isolation. Three boundaries matter and are
tracked explicitly here rather than left as implicit assumptions.

## Boundary with financial-calc-verification: exchange rate staleness

`financial-calc-verification` guarantees a single calculation call is
arithmetically correct at the moment it runs. It has no visibility into what
happens to that result while a transaction sits in an offline queue for
minutes or hours.

`offline-resilience` owns that gap: Step 1b locks the rate at queue time and
requires explicit user re-confirmation if the rate-validity window expires
before the transaction executes, rather than silently re-quoting. Without
this, a transaction could be arithmetically correct at calculation time and
still deliver a different amount than the sender approved - which defeats
the trust guarantee both skills exist to protect, just at a different layer.

## Boundary with vulnerable-user-ui-safety: local PII encryption model

`offline-resilience` encrypts the local pending-operations queue with an
**app-level key** (platform keystore), not a user-secret-derived key, so
that background sync can run without the user present. This is a deliberate
trade-off, not an oversight:

- **Protected**: someone browsing the device's raw storage while the app
  isn't running (offline file inspection).
- **Not protected by this skill**: someone with the device unlocked in hand,
  opening the app itself.

That second threat is explicitly deferred to `vulnerable-user-ui-safety`,
which closes it with cold-launch authentication, auto-lock on inactivity, and
screen masking on backgrounding. If a project adopts `offline-resilience`
without also adopting `vulnerable-user-ui-safety` (or an equivalent), this
gap remains open - the encryption model alone does not defend against a
person holding an unlocked, already-open device.

## Boundary with the compliance file

Both `financial-calc-verification` and `offline-resilience` read the same
project-level compliance file (see the `compliance-template.md` reference in
`financial-calc-verification`). This skill specifically needs:

- Transfer limits, for the Step 7 re-validation on retry
- Rate validity window, for Step 1b

Keeping this in one shared file (rather than duplicating relevant rules into
each skill's own bundled reference) means a regulatory change - e.g. NRB
adjusting a transfer ceiling - only needs to be updated in one place. The
trade-off: this skill is inert if the project doesn't maintain that file's
presence. Step 0-equivalent behavior here (Step 7's compliance check) should
halt loudly rather than proceed on an assumed value if the file is missing.
