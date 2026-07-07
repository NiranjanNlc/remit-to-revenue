# On-Screen Exposure Checklist

For any screen that displays personal or financial data that could be read
by someone nearby (shoulder-surfing) or by another person using the same
shared device later.

## Data minimization

- Never show a full name and a full phone number together on the same
  screen by default.
- Mask identifying details in list views - e.g. "Sita K*****" rather than a
  full name - with full detail available only behind a deliberate action.

## Shoulder-surfing protection

- On transaction confirmation, show the recipient identifier masked by
  default, with a "tap to reveal" control requiring a short deliberate
  press, not a passive hover or automatic display.
- The reveal auto-hides after a short timeout appropriate to the screen's
  risk level (see the conflict-resolution note in SKILL.md Step 2 and the
  timeout values in `screen-examples.md`).

## Balance display

- Home-screen balance is masked or hidden by default; shown only after brief
  authentication or via an explicit toggle.
- Never leave an unlocked balance view persistently visible when the app is
  idle.

## Transaction history

- By default, show only dates and masked amounts or masked identifiers.
- Full receipt detail is one deliberate tap deeper, and that detail view
  auto-closes after a period of inactivity (see `screen-examples.md` for the
  specific timeout and the reasoning for why it differs from the
  confirmation screen's).

## Resolving conflicts with comprehension

Some screens need to show identifying detail specifically so the user can
verify they're sending to the right person - masking that detail
unconditionally would remove a safeguard against unrecoverable misdirected
transfers, which is a more severe harm than a shoulder-surfing exposure in
many cases. Do not apply a single blanket rule ("always mask" or "always
show"). Resolve per screen type based on whether verification is the active
purpose of that screen (confirmation) or a passive/retrospective one
(history) - see `screen-examples.md` for the worked resolution on each.
