# Involuntary Exposure Checklist

Covers exposure that can happen outside the user's active attention - when
the app is backgrounded, when a notification arrives, when the device sits
unlocked and unattended, or on a fresh cold launch.

## Cold-launch authentication

- Require PIN, pattern, or biometric on every fresh app launch, independent
  of whether the OS itself is currently locked. In this context, devices are
  frequently handed between family members while unlocked, and OS lock
  screens are often disabled or set to long timeouts for convenience - the
  app cannot rely on the OS as a first line of defense.
- This gate blocks UI access only. It does not block the background sync
  engine (see `offline-resilience`'s app-level keystore encryption model),
  which must be able to decrypt and send queued transactions without the
  user present.
- See `cold-launch-auth-design.md` for the specific mechanism (pattern-lock
  first, with a PIN fallback) and why a naive PIN-or-biometric-only design
  would conflict with this population's comprehension needs.

## Auto-lock

- Lock after a configurable inactivity period (default 60 seconds).
- On lock, remove all sensitive data from the visible screen immediately -
  not dimmed, not blurred in a way that's still partially legible, actually
  removed.
- Require the same authentication used at cold launch to resume.

## Screen masking on background

- The instant the app backgrounds (app switch, incoming call, home button),
  replace the current screen with a blank or branded splash view before the
  OS captures its app-switcher snapshot.
- Verify on each target platform that the app-switcher/task-switcher preview
  shows no transaction detail, balance, or recipient information - this
  typically requires an explicit secure-view flag or an onPause/
  applicationWillResignActive hook that swaps the rendered view, not just an
  assumption that the OS handles it.

## Notifications

- Never include recipient name, amount, or account/phone numbers in a push
  notification body or preview.
- Use a generic confirmation - "You received money" - rather than any
  specific detail.
- Tapping a notification opens to the cold-launch authentication gate first,
  never directly to a detailed view.

## Clipboard

- Never programmatically copy sensitive data (account numbers, full names,
  amounts) to the system clipboard, where any other app on the device could
  read it.

## What this does not cover

This checklist assumes the device itself may be compromised at the OS level
(shared, unlocked, or otherwise accessible) but does not address device-level
security (rooted/jailbroken detection, OS-level malware) - that is outside
this skill's scope.
