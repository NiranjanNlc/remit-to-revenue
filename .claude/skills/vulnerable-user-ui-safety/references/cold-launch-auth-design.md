# Cold-Launch Authentication Design

## The tension this resolves

Cold-launch authentication exists to close a specific gap:
`offline-resilience` encrypts its locally queued data with an app-level
keystore key rather than a user-secret-derived key, specifically so
background sync can run without the user present. That choice means nothing
stops someone from opening the app on an already-unlocked device and seeing
decrypted data immediately - no inactivity timer or backgrounding event has
fired yet, because none of those apply to a fresh launch.

The direct fix - require PIN or biometric on every launch - creates a second
problem if applied naively: this population includes many users with low
literacy and limited experience with device security features. A security
gate that a meaningful fraction of users can't reliably set up, remember, or
recover is not a safeguard, it's a lockout - and in practice tends to produce
workarounds that are worse than the original threat (PINs written on paper
taped to the phone, abandoned onboarding, support-line overload).

Both constraints are real. Neither should be dropped to satisfy the other.

## The chosen mechanism

**Pattern lock as the primary method, with a numeric PIN as an explicit
fallback, and biometric as an optional convenience layer:**

- **Pattern lock** (a 3x3 grid, trace a shape): larger touch targets than a
  PIN pad, spatially memorable without requiring numeracy or literacy.
  Setup uses an illustrated flow (a hand tracing the pattern) with minimal
  required text - "आफ्नो ढाँचा बनाउनुहोस्" (Create your pattern) - and the
  user practices the pattern twice during onboarding to confirm recall
  before it's set as the active lock.
- **4-digit PIN** as an alternative for users who prefer numbers or on
  devices where pattern input is unreliable. Large, high-contrast number
  pad.
- **Biometric (fingerprint)** as an opt-in layer on top of pattern/PIN, never
  a replacement for it - there is always a non-biometric fallback, since
  biometric enrollment and recognition can fail for reasons outside the
  user's control (worn fingerprints from manual labor, sensor quality on
  low-cost devices).
- **Generous retry**: five attempts before a 30-second cooldown, not a
  permanent lockout.
- **Recovery path**, not a dead end: after repeated failed cooldown cycles,
  offer "आफ्नो ढाँचा बिर्सनुभयो? सहायताको लागि यहाँ थिच्नुहोस्" (Forgot your
  pattern? Tap here for help), routing to a support contact or a
  trusted-contact verification flow - never a flow that locks the user out
  of their own funds indefinitely.
- **Setup at onboarding**, using the same illustrated, plain-language
  standard as every other screen - no email, no password, no security
  questions, nothing that assumes literacy this population may not have.

## Why this isn't a fully eliminated tension

Security and accessibility remain in genuine tension here, and this design
doesn't pretend otherwise - a pattern lock is somewhat easier to observe and
replicate by a shoulder-surfer than a longer PIN would be, and a 30-second
cooldown after five attempts is a real (if modest) window for a determined
attacker with physical access. The design accepts that trade-off explicitly:
a lockout that lets no one in is not a safer product for this population,
it's a support-ticket generator that pushes users toward less safe
workarounds (writing the code down). Treat this as a deliberate, documented
choice to revisit if real usage data suggests the balance should shift -
not as a solved problem.

## What this does NOT change

- The background sync engine still uses `offline-resilience`'s app-level
  keystore key and can decrypt and send queued transactions without user
  presence - cold-launch authentication gates UI access only.
- After a successful cold-launch authentication, the normal auto-lock
  inactivity timer (see `involuntary-exposure-checklist.md`) begins as
  usual.
