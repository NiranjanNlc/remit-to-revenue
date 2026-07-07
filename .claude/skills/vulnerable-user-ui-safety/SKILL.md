---
name: vulnerable-user-ui-safety
description: Use whenever designing, reviewing, or generating user-visible content, interaction flows, or app-level behavior (backgrounding, locking, notifications) for an app serving low-digital-literacy users who may share devices - screen layouts, text strings, icons, error messages, confirmation dialogs, onboarding, and app lifecycle behavior. Trigger is deliberately broad, since designs that look clear to a literate, financially experienced developer routinely confuse or expose a vulnerable user in ways that surface only after real harm - banking jargon, dense confirmations, persistent on-screen PII, missing auto-lock. Covers three distinct concerns routed by a single judgment call per design surface - can the user understand this, could someone nearby read this off the screen, and could this leak when the user isn't actively looking (background, notification, cold launch on an unlocked device). Not for the underlying arithmetic (see financial-calc-verification) or network/sync behavior (see offline-resilience).
---

# Vulnerable-User UI and Content Safety

## Why this exists

This app serves people with low digital and financial literacy, on devices
frequently shared among family members, in a population that is a common
target for remittance-related scams. A design that reads as "obviously fine"
to a literate, financially experienced developer can silently mislead a user
into a bad decision, or expose their data to someone who shouldn't see it -
and the development team may never witness the harm.

## Step 0: Classify the design surface

Every design task is checked against three distinct concerns. They are
routed by a single entry-point judgment, not three separate trigger checks,
because most real screens hit more than one at once:

1. **Comprehension** - the user must read, understand, or decide based on
   what's shown.
2. **On-screen exposure** - the screen displays personal or financial data
   that could be read by someone nearby, or by another person using the
   device later.
3. **Involuntary exposure** - sensitive data could be visible outside the
   user's active attention: backgrounded, in a notification, in the app
   switcher, or on a cold launch of an unlocked device.

A screen can hit one, two, or all three. Resolve each that applies; where two
concerns conflict on the same surface, resolve deliberately (see Step 2's
conflict-resolution note) rather than defaulting to a blanket rule.

## Step 1: Comprehension

See `references/comprehension-checklist.md` for the full checklist. Core
principles:

- Plain language in the user's language, avoiding English loanwords and
  banking jargon - "the fee we take," not "exchange rate spread."
- Concrete, universally recognizable icons for this context; test choices
  against real users rather than assuming familiarity.
- Distinct, unambiguous action labels for critical actions - not bare
  "Cancel"/"Confirm," but labels that state the concrete consequence.
- Large, clear amount display with the currency symbol always visible.

## Step 2: On-screen exposure

See `references/on-screen-exposure-checklist.md` for the full checklist. Core
defenses:

- Data minimization - never show full name and phone number together by
  default.
- Mask identifying details (e.g. partial name) with a deliberate "tap to
  reveal" control, not permanent visibility.
- Balance hidden or masked by default on shared/idle screens.

**Conflict resolution with comprehension**: some screens need to show
identifying detail specifically so the user can verify they're not sending
money to the wrong person - a mistake that can be unrecoverable. Do not
default to masking in a way that removes this safeguard. The resolution is
contextual, not a blanket rule: high-stakes verification moments (transaction
confirmation) show the detail behind a short, deliberate reveal action with a
brief auto-hide timeout; passive/retrospective views (transaction history)
default to masked, since verification isn't the active goal there. See the
checklist for the reasoning behind each screen type's specific choice - the
timeout lengths differ deliberately by risk level, not arbitrarily.

## Step 3: Involuntary exposure

See `references/involuntary-exposure-checklist.md` for the full checklist.
This step also closes an explicit obligation from `offline-resilience`,
which encrypts its local queue with an app-level key precisely so background
sync can run without the user present - meaning it cannot, by itself, stop
someone from opening the app on an unlocked device. This skill closes that
gap. See `references/cold-launch-auth-design.md` for the full reasoning
behind the authentication mechanism chosen.

- **Cold-launch authentication**: required on every fresh app launch,
  independent of OS lock state - the OS lock screen can't be relied on alone,
  since it's frequently disabled or set to a long timeout in this context.
  This gates UI access only; it does not block the background sync engine.
- **Auto-lock**: after a configurable inactivity period (default 60s),
  requiring re-authentication to resume, with sensitive data removed from
  the screen immediately on lock, not just dimmed.
- **Screen masking on background**: replace the active screen with a blank
  or branded splash the instant the app backgrounds; ensure the OS app
  switcher snapshot shows no transaction or balance detail.
- **Notifications**: never include recipient name, amount, or account
  numbers - "You received money," not "Sita sent NPR 10,000." Tapping opens
  to the authentication gate first.
- **Clipboard**: never copy sensitive data where another app could read it.

Authentication itself must meet the Step 1 comprehension bar - see
`references/cold-launch-auth-design.md` for why a low-literacy-friendly
pattern-lock-first design was chosen over a PIN-only or biometric-only gate,
and how the recovery path avoids becoming a hard lockout.

## Step 4: Cross-check interruptions against comprehension

When an involuntary-exposure defense interrupts an in-progress task (e.g.
auto-lock fires mid-transaction), the user must return to exactly the same
state after re-authenticating, with a message that reassures rather than
alarms - "Your phone locked for security. Enter your PIN to continue," not a
generic or technical lock notice.

## Step 5: Verification checklist

Before finalizing any design, verify:

- The app requires authentication on every cold launch - no sensitive data
  visible before that gate, regardless of OS lock state.
- Auto-lock fires within the defined inactivity period; the lock screen is
  blank of sensitive data.
- The app switcher shows no transaction detail.
- No screen shows a full name and phone number together without an active,
  deliberate reveal.
- No notification contains an amount or recipient identifier.
- Every critical action has an explicit, jargon-free label in the user's
  language.
- Error messages state what happened and what to do next, in concrete terms.
- No untranslated financial jargon appears anywhere in the flow.
- The authentication flow itself (setup, entry, recovery) meets the same
  comprehension bar as every other screen - illustrated steps, no required
  literacy or numeracy for the primary path, a non-lockout recovery option.

## Step 6: Worked examples

See `references/screen-examples.md` for how the decision tree resolves on
real screens - transaction confirmation, transaction history, a financial
literacy tip card, and the cold-launch authentication screen itself.
