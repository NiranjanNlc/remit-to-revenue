# Comprehension Checklist

For any screen, string, or flow where the user must read, understand, or
decide based on presented information.

## Language

- All instructional text, labels, and error messages in plain Nepali (or the
  user's selected language), avoiding English loanwords unless they are
  genuinely universally understood in everyday speech.
- No banking jargon. Translate the underlying concept plainly:
  - "exchange rate spread" → "हामीले लिने शुल्क" (the fee we take)
  - "beneficiary" → "पैसा पाउने व्यक्ति" (the person receiving money)
- Numbers written with the currency symbol (रू) always visible. Avoid
  unnecessary decimal clutter - for whole rupee amounts, omit paisa unless
  it's actually nonzero.

## Icons

- Concrete and universally recognizable in the target context (rural Nepal) -
  a house for home, a hand receiving coins for recipient, a clock for
  pending status.
- Test icon choices against real users from the target population rather
  than assuming familiarity from other apps; icon conventions from
  Western/urban banking apps do not reliably transfer.
- Ask, for each icon: does this need accompanying text to be unambiguous? If
  yes, include it - an icon alone is not sufficient for a critical action.

## Actions

- Critical actions (send, confirm, cancel) get distinct, unambiguous labels
  that state the concrete consequence - not bare "Cancel"/"Confirm."
  - "हो, पैसा पठाउनुहोस्" (Yes, send money) / "होइन, फर्कनुहोस्" (No, go back)
- A confirmation step for any irreversible action must make the
  irreversibility clear in plain language, not assume the user infers it.

## Error messages

- State what happened and what the user should do next, in concrete terms -
  never a raw technical message ("Network error 500") or an unexplained
  failure.
- Reassure rather than alarm where the situation is recoverable (e.g. a
  security lock is not the same tone as a failed transaction).

## Testing the design itself

Where feasible, validate copy and icon choices with actual low-literacy
users before shipping - a developer's or reviewer's sense of "clear" is not
a reliable proxy for this population's actual comprehension.
