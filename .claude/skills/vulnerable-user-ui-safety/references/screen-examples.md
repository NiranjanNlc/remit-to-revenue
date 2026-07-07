# Worked Screen Examples

How Step 0's three-way classification resolves on real screens in this app.
These are illustrative, not exhaustive - use the same reasoning process for
any screen not listed here.

## Transaction confirmation screen

Hits all three concerns.

- **Comprehension**: "पैसा पठाउने पुष्टि गर्नुहोस्" (Confirm sending money),
  amount in large font, fee breakdown in plain language, two distinct
  buttons - "हो, पठाउनुहोस्" / "होइन, रोक्नुहोस्".
- **On-screen exposure**: recipient identifier shown masked by default, with
  a "tap to reveal" control. Reveal auto-hides after **10 seconds** - short,
  because this is an active, high-stakes moment where the user is likely
  still holding the phone, and the goal is to minimize the window a
  shoulder-surfer has if the phone is set down immediately after sending.
- **Involuntary exposure**: auto-lock timer is active as normal; if the app
  backgrounds mid-confirmation, screen masking applies immediately and the
  pending confirmation state is preserved for when the user returns.

## Transaction history list

Hits comprehension lightly and on-screen exposure primarily; involuntary
exposure applies at the list level, not per-row.

- **Comprehension**: each row shows a date and a status icon (clock for
  pending, checkmark for completed) - no action required, so minimal
  language is needed. This is a passive viewing surface, not a decision
  point.
- **On-screen exposure**: names masked by default; amounts shown but not
  linked to full identifying detail in the default view. Full receipt detail
  is one tap deeper, gated behind the app's existing authenticated session,
  and that detail view auto-closes after **30 seconds** of inactivity -
  longer than the confirmation screen's window, because this is
  retrospective review rather than an active transaction, and the immediate
  risk is lower.
- **Involuntary exposure**: app-switcher snapshot for this screen (like any
  screen) shows a generic app logo, never the actual list content.

## Financial literacy tip card

Comprehension only - no personal data involved.

- **Comprehension**: plain-language savings tip ("तपाईंको प्रत्येक पठाइएको
  पैसाको ५% जोगाउनुहोस्..."), supported by a simple icon (a piggy bank), no
  jargon.
- **On-screen exposure**: none - no personal or financial data is displayed.
- **Involuntary exposure**: none - nothing sensitive to protect on this
  screen.

## Cold-launch authentication screen

A special case: this screen exists specifically to gate access to the other
three, so it must itself pass the same bar.

- **Comprehension**: pattern setup uses illustrated steps rather than dense
  text. Mismatch error: "ढाँचा मिलेन। फेरि प्रयास गर्नुहोस्" (Pattern didn't
  match. Try again), paired with a visual of the correct motion, not just
  text. Recovery flow uses plain language throughout, no technical terms.
- **On-screen exposure**: the entry screen itself shows no personal data at
  all - only the input grid or number pad. No balance, name, or transaction
  preview is visible until authentication succeeds.
- **Involuntary exposure**: if the app backgrounds mid-entry (e.g. an
  incoming call interrupts pattern entry), screen masking applies
  immediately as it would anywhere else. On successful authentication, the
  user lands on the home screen - never a deep-linked sensitive view that
  bypasses the normal navigation flow.
