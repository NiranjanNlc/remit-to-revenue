# Verification Scenarios

Worked examples for `calculateReceive`. Each includes the invariant it checks
and an independent plausibility estimate (never derived from the same rate
parameter being tested).

## Scenario 1 — INR corridor (no conversion)

- Inputs: send = 100000 paisa (1000 NPR), fixed fee = 5000 paisa, rate = 100,
  target = INR.
- Calculation: receive = 100000 - 5000 = 95000 paisa (950 INR).
- Invariant checked: INR corridor performs no conversion; fee subtracted
  directly.
- Plausibility check: 1000 NPR minus a 50 NPR fee is roughly 950 INR at 1:1.
  Matches.

## Scenario 2 — USD corridor, fraction rounds down

- Inputs: send = 100001 paisa (1000.01 NPR), fee = 0, rate = 75 (75 US cents
  per 100 NPR), target = USD.
- Calculation: floor((100001 * 75 + 5000) / 10000)
  = floor((7500075 + 5000) / 10000) = floor(7505075 / 10000) = 750 cents
  ($7.50).
- Invariant checked: half-up rounding with a fractional part below 0.5 rounds
  down.
- Plausibility check: 1000 NPR at roughly 0.0075 USD/NPR is about $7.50.
  Matches.

## Scenario 3 — USD corridor, exact half-cent rounds up

- Inputs: send = 100067 paisa (1000.67 NPR), fee = 0, rate = 75, target = USD.
- Calculation: product = 100067 * 75 = 7,505,025.
  floor((7505025 + 5000) / 10000) = floor(7510025 / 10000) = 751 cents
  ($7.51).
- Invariant checked: the exact value 750.5025 cents rounds up to 751 under
  half-up rounding.
- Plausibility check: 1000.67 NPR at roughly 0.0075 USD/NPR is about $7.505,
  which rounds to $7.51. Matches.

## Scenario 4 — Fee cap in effect

- Inputs: send = 100000 paisa, feePercentBips = 200 (2%), feeCap = 1500 paisa,
  fixedFee = 500 paisa.
- Calculation: feeFromPercent = floor(100000 * 200 / 10000) = 2000 paisa.
  totalFee = min(max(500, 2000), 1500) = 1500 paisa. net = 98500 paisa.
- Invariant checked: fee never exceeds the configured cap even when the
  percentage-based fee would otherwise be higher.
- Plausibility check: 1500 paisa is 15 NPR on a 1000 NPR send — a plausible
  fee magnitude, not the 2000-paisa (20 NPR) value the percentage alone would
  produce.

## Scenario 5 — KRW corridor (zero decimal places)

- Inputs: send = 100000 paisa (1000 NPR), fee = 0, rate = 1250 (1250 KRW per
  100 NPR), target = KRW.
- Calculation: floor((100000 * 1250 + 5000) / 10000)
  = floor((125000000 + 5000) / 10000) = floor(125005000 / 10000) = 12500 KRW.
- Invariant checked: a target currency with zero minor-unit subdivisions is
  handled correctly by the rate convention alone — no separate divisor is
  needed.
- Plausibility check: 1000 NPR at roughly 12.5 KRW/NPR is about 12,500 KRW.
  Matches. (A magnitude error here — e.g. producing 125,000,000 KRW for a
  ~$7.50 transfer — is exactly the class of bug this check exists to catch:
  internally self-consistent, but wrong by four orders of magnitude against
  reality.)

## Why the plausibility check is a separate, mandatory line item

An earlier version of this scenario set validated each result only against
the formula's own invariants and passed every check while being wrong by a
factor of roughly 12,000 on the KRW case, due to a missing unit-conversion
factor. The invariant checks confirmed the formula agreed with itself; they
could not catch that the formula's premise was wrong. The plausibility check,
anchored to a ballpark rate maintained independently in the compliance file,
is what catches that class of error.
