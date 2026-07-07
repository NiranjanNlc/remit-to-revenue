# Reference Implementation

Complete, runnable example matching the specification in SKILL.md and the
scenarios in `verification-scenarios.md`. All arithmetic is integer. All
invariant violations throw — none merely log.

```javascript
/**
 * Calculate the amount a recipient receives, in the target currency's
 * smallest unit, given a send amount in NPR paisa.
 *
 * @param {number} sendPaisa - integer, NPR paisa (1 NPR = 100 paisa)
 * @param {number} feeFixed - integer, fixed fee in NPR paisa
 * @param {number} feePercentBips - integer, fee percentage in basis points
 *   (200 = 2%)
 * @param {number} feeCap - integer, maximum fee in NPR paisa
 * @param {number} ratePer100NPR - integer, foreign minor units per 100 NPR.
 *   For the INR corridor this must be exactly 100 (1:1, no conversion).
 * @param {string} targetCurrency - ISO currency code of the recipient
 *   currency, e.g. 'INR', 'USD', 'KRW'.
 * @returns {number} integer, amount in the target currency's smallest unit
 * @throws {Error} on any invariant violation - never silently continues
 */
function calculateReceive(sendPaisa, feeFixed, feePercentBips, feeCap, ratePer100NPR, targetCurrency) {
  if (!Number.isInteger(sendPaisa) || sendPaisa <= 0) {
    throw new Error('sendPaisa must be a positive integer');
  }
  if (!Number.isInteger(feeFixed) || feeFixed < 0) {
    throw new Error('feeFixed must be a non-negative integer');
  }
  if (!Number.isInteger(feePercentBips) || feePercentBips < 0) {
    throw new Error('feePercentBips must be a non-negative integer');
  }
  if (!Number.isInteger(feeCap) || feeCap < 0) {
    throw new Error('feeCap must be a non-negative integer');
  }
  if (!Number.isInteger(ratePer100NPR) || ratePer100NPR <= 0) {
    throw new Error('ratePer100NPR must be a positive integer');
  }

  const feeFromPercent = Math.floor(sendPaisa * feePercentBips / 10000);
  const totalFee = Math.min(Math.max(feeFixed, feeFromPercent), feeCap);

  if (totalFee > sendPaisa) {
    throw new Error('Fee exceeds send amount');
  }

  const netPaisa = sendPaisa - totalFee;

  if (targetCurrency === 'INR') {
    if (ratePer100NPR !== 100) {
      throw new Error('INR corridor requires rate of 100 (1:1)');
    }
    // Compliance ceiling check belongs here, sourced from the corridor's
    // rules in the compliance file — not hardcoded.
    return netPaisa;
  }

  // Non-INR: convert with half-up rounding. The 10000 divisor accounts for
  // both paisa-to-NPR conversion and the rate's "per 100 NPR" convention.
  const numerator = netPaisa * ratePer100NPR;
  const receive = Math.floor((numerator + 5000) / 10000);

  if (receive < 0) {
    throw new Error('Receive amount cannot be negative');
  }

  return receive;
}

module.exports = { calculateReceive };
```

## Notes for languages without exceptions

Use an assert library or error-result pattern that the caller cannot ignore
by default (e.g. Rust's `Result`, Go's explicit error return checked before
use). The requirement is that no invariant violation allows execution to
continue with an unverified value — the mechanism matters less than the
guarantee that it actually halts.

## Test harness expectations (Step 4)

Each scenario in `verification-scenarios.md` should exist as an automated
test asserting the exact expected output, not an approximate match. The
plausibility checks documented alongside each scenario are a design-time
sanity check for whoever writes the test, not something to encode as a loose
assertion in the test itself — the automated test should still assert the
exact value.
