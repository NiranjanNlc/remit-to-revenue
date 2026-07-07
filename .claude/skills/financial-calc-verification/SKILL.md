---
name: financial-calc-verification
description: Use whenever designing, implementing, or reviewing any code that computes, transforms, stores, or displays monetary amounts, fees, exchange rates, or balances in a remittance or fintech system, regardless of how simple the arithmetic looks. Covers backend and frontend logic, helper functions, configuration values, and display formatting. Fires even on requests that seem trivial, such as "add a fee calculation" or "format this balance" - under-firing is the main risk, since silent numerical errors happen exactly when a calculation is dismissed as too small to need verification. Not for pure UI copy, layout, or non-monetary logic (see vulnerable-user-ui-safety for that). Requires a project compliance reference file for corridor rules, fee structures, rounding rules, and currency minor-unit counts; halts and asks for it if missing rather than guessing.
---

# Financial Calculation Mechanical Verification

## Why this exists

Numerical errors in monetary code are silent by nature: a rounding mistake, a
misordered fee, or a wrong currency-conversion factor produces a plausible-looking
number, not a crash. In a remittance app serving low-income families, a small
per-transaction error compounds across thousands of transfers into real,
undiscovered financial harm. This procedure replaces "be careful with money"
with a mechanical sequence: specification, invariants, checklist, verified
implementation, independent plausibility check.

This applies to **every** unit of code that touches money. There is no
"too simple to verify" exception - the most dangerous bugs hide in the
calculations that looked too trivial to check.

## Step 0: Load domain constraints

Retrieve `references/compliance.md` (or the project's equivalent compliance
file). Extract everything relevant to the current corridor and operation:
transfer limits, fee structures, rounding rules, each currency's minor-unit
count (decimal places), and ballpark reference rates for sanity checking.

If the file is missing or incomplete, stop and request it. Do not assume any
rate, limit, or rounding rule.

## Step 1: Write the mathematical specification with explicit invariants

Before writing any code, define what the calculation guarantees, as concrete,
testable statements - not prose intentions.

Representation rules:
- All monetary amounts are integers in the smallest currency unit (paisa for
  NPR, cents for USD, won for KRW, etc.). No floating-point in any monetary
  arithmetic, ever.
- The exchange rate is expressed as **foreign minor units per 100 NPR** (e.g.
  75 for USD, ~1250 for KRW). This single convention, combined with the
  integer-minor-unit representation, is what keeps the arithmetic
  floating-point-free and currency-agnostic - it does not need a separate
  per-currency divisor, because the target currency's own subdivision is
  already baked into the rate.
- Fee formula: `totalFee = max(fixedFee, min(sendAmount * feePercentBasisPoints / 10000, feeCap))`,
  all integer arithmetic.
- INR corridor: rate must equal `100` (1:1, no conversion).
  `receiveAmount = sendAmount - totalFee`. No rounding needed.
- Other corridors, with half-up rounding: given `netAmount` in NPR paisa and
  `rate` as foreign minor units per 100 NPR,
  `receiveAmount = floor((netAmount * rate + 5000) / 10000)`.
  (The 10000 divisor accounts for both the paisa-to-NPR conversion and the
  rate's own "per 100 NPR" convention - trace the units explicitly before
  reusing or modifying this formula for a new representation.)
- Invariants: `receiveAmount >= 0`; send amount > 0; fee never exceeds send
  amount.
- The rounding rule (half-up, truncation, etc.) is taken directly from the
  compliance file - never defaulted by whoever writes the code. If the file
  is silent on it, that is a missing constraint, not a free choice.

Resolve every ambiguity at this stage. A specification with an unresolved
branch ("do X, or maybe Y - check compliance") is not a specification; it is
a deferred bug.

## Step 2: Derive a verification checklist, including a real-world sanity check

From the invariants, generate concrete test scenarios. Each scenario states
inputs, expected output, and the invariant it checks.

**Every scenario also needs an independent plausibility check** - not a
re-derivation from the same rate parameter being tested, since that only
verifies the formula agrees with itself. Use a ballpark reference rate stored
separately in the compliance file (e.g. "1 NPR is roughly 0.0075 USD, 12.5
KRW") to estimate the expected order of magnitude. If the computed result
differs from that independent estimate by more than roughly 2x, stop -
the rate representation or unit scaling is almost certainly wrong, even if
every invariant above technically "passed."

See `references/verification-scenarios.md` for worked examples across the
INR, USD, and KRW corridors, including the half-up rounding edge cases and
the fee-cap case.

## Step 3: Implement with embedded, halting invariant checks

Write the function using integer arithmetic only. Every invariant becomes an
explicit check that **halts execution** on violation - `throw`, not `console.assert`
or any other mechanism that merely logs and continues. A check that can be
silently bypassed provides no guarantee.

See `references/reference-implementation.md` for a complete, runnable example
covering the INR and non-INR paths, fee-cap handling, and input validation.

## Step 4: Validate against the checklist

Run every scenario from Step 2 - automated tests where possible, manual trace
otherwise. Every output must match exactly, including the sanity-check
comparison. If any scenario fails, the implementation is not done. Iterate.

## Step 5: Review for common pitfalls

- No floating-point at any stage, including intermediate values.
- Fee subtracted before conversion, not after.
- Cumulative operations (balance updates, repeated small transactions) tested
  for losslessness - no drift across many operations.
- Rounding direction matches the compliance file exactly.
- Display formatting is separate from calculation: integer minor units are
  converted to a decimal string only for presentation, never for storage or
  further arithmetic.
- The output's order of magnitude was checked against an independent
  estimate, not just against the formula's own internal consistency.
