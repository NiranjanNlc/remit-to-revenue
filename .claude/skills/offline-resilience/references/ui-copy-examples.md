# UI Copy Examples for Offline / Pending States

Plain-language examples. Never surface raw status codes, stack traces, or
technical error names to the user - always translate to what happened and
what the user should expect next.

## Queued while offline (transfer submission)

- Nepali: "सुरक्षित भयो। तपाईं इन्टरनेटमा जोडिंदा हामी पैसा पठाउनेछौं।"
- English: "Saved. We'll send it once you're back online."

## Temporary failure, will retry automatically

- Nepali: "हामीले तपाईंको पैसा अहिले पठाउन सकेनौं। तपाईंको इन्टरनेट जाँच गर्नुहोस्। हामी केही मिनेटमा पुन: प्रयास गर्नेछौं।"
- English: "We couldn't send your money right now. Check your internet. We'll try again in a few minutes."

## Rate expired while queued (Step 1b)

- Nepali: "विनिमय दर परिवर्तन भएको छ। कृपया नयाँ रकम हेरेर पुष्टि गर्नुहोस्।"
- English: "The exchange rate has changed. Please review the new amount and confirm."

## Max retries reached, needs manual retry

- Nepali: "पैसा पठाउन सकिएन। पुन: प्रयास गर्नुहोस् थिच्नुहोस्।"
- English: "We couldn't send this. Tap Retry to try again."

## Non-retryable failure (e.g. invalid recipient)

State the specific, actionable reason - never a generic failure message when
the cause is known.

- Nepali (example: invalid account): "प्राप्तकर्ताको खाता नम्बर मिलेन। कृपया जाँचेर फेरि पठाउनुहोस्।"
- English: "The recipient's account number doesn't match. Please check it and resend."

## General principles

- State what happened, in concrete terms, not the underlying cause the user
  can't act on ("Network error 500" tells the user nothing they can act on).
- State what happens next, or what the user should do.
- Never imply money was lost when it's actually just queued or retrying -
  distinguish "still trying" from "failed."
- Keep pending and confirmed amounts visually and linguistically distinct in
  any list or summary view.
