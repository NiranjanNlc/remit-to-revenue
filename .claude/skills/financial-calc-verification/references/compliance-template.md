# Compliance Reference — Template

This skill's Step 0 expects a compliance file at the project root (e.g.
`docs/compliance.md`) with at least the sections below. This file is a
**template to copy and fill in with real, verified figures** — the values
below are placeholders and must not be used as-is. `offline-resilience` also
reads the rate-validity-window and transfer-limit sections of this same file.

## Corridor rules

For each supported corridor (destination country/currency):

- Maximum single-transfer amount
- Maximum cumulative transfer amount per period (daily/monthly), if any
- Whether currency conversion applies, or the corridor is fixed-rate
  (e.g. the India corridor's 1:1 NPR-INR handling)
- KYC document requirements for transfers above any threshold

## Fee structure

- Fixed fee, percentage fee, and fee cap per corridor or transfer band
- Whether fees differ by payment method or partner

## Currency minor-unit table

| Currency | Minor unit | Decimal places |
|---|---|---|
| NPR | paisa | 2 |
| INR | paisa | 2 |
| USD | cent | 2 |
| KRW | won | 0 |
| ... | ... | ... |

## Rounding rule

State explicitly, per corridor if it varies: half-up, half-even, truncation,
etc. This is a business/regulatory decision, not a default the implementation
should choose.

## Ballpark reference rates (for plausibility checks only)

A small, human-maintained table, updated independently of the precise
operational exchange rates, used only for the sanity check in Step 2 of
`financial-calc-verification`. Approximate values are fine and expected —
precision here would defeat the purpose of an independent check.

| Currency | Approx. rate (1 NPR ≈) |
|---|---|
| INR | 1 |
| USD | 0.0075 |
| KRW | 12.5 |
| ... | ... |

## Rate validity window (used by offline-resilience)

How long a locked exchange rate remains honorable for a queued-but-unsent
transaction before requiring user re-confirmation.
