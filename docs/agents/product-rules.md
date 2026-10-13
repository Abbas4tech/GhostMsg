# Product Rules for Agents

The product invariants, UX conventions and copy rules every change must keep. Architecture rules (tiers, folders, tests) live in [component-architecture.md](component-architecture.md) and [source-structure.md](source-structure.md); this file is about **what the product promises**. Each rule names where it is enforced so you can check your change against it.

Use the glossary's terms verbatim ([`GLOSSARY.md`](../../GLOSSARY.md)): Recipient, Anonymous Message, Public Profile Link, Message Acceptance, Sender Hash, Quarantined Message, Sentiment Tag, Public Q&A, AMA Prompt, Suggested Message, Display Name, Quarantine Sensitivity, Quiet Hours, Hidden Preview, Palette.

---

## 1. Safety and privacy invariants

Full reasoning: [Chapter 17](../17-trust-safety-and-privacy.md). A change that breaks one of these is wrong even if tests pass.

| # | Invariant | Enforced in | How to check |
| :-- | :--- | :--- | :--- |
| S1 | No sender identity (IP, user agent, account) is stored or returned. Senders exist only as a per-recipient HMAC `senderHash`. | `send-message` route, `security.ts` | Grep your diff for `x-forwarded-for`, `ip`, `userAgent` reaching a model or response. |
| S2 | A blocked sender gets the normal success response; the message is dropped silently. | `send-message` | Same status and body as a delivered message. |
| S3 | Quarantined messages never alert (email, push, digest, live toast) and are concealed until revealed. | `send-message`, `daily-digest.ts`, `buildLiveMessageToast`, `MessageCard`, `RevealMessageModal` | Any new channel filters `isQuarantined` and has a test for it. |
| S4 | Moderation routes; it never deletes. AI failure fails **open** for delivery (`toxicity: "none"`). | `moderation.ts`, `quarantine-policy.ts` | Unit tests. |
| S5 | Quarantine decisions use the Recipient's `safetySettings` through `shouldQuarantine`; don't add parallel thresholds. | `quarantine-policy.ts` | One call site in `send-message`. |
| S6 | Nothing becomes public without an explicit per-answer choice. `publishByDefault` only pre-sets the switch. | Smart Reply, `reply` route | `isPublished` comes from the request. |
| S7 | Notification text is hidden by default (`hideMessageText ?? true`) in push, email, digest and the live toast; quiet hours suppress email, push and digests. | `delivery-policy.ts`, `daily-digest.ts`, `use-live-messages.utils.ts` | Use `buildAlertPreview` and `isWithinQuietHours` for any new alert. |
| S8 | Public endpoints expose only: username, display name, avatar, AMA prompt + banner flag, suggestions flag, acceptance, published answers. Never email, hashes or settings. | `public/[username]/answers` | Review the response object literal. |
| S9 | Destructive actions are undoable (timer) or typed-to-confirm, and the server re-validates confirmations. | danger-zone controller, `DELETE /api/user` | [ADR 0027](../adr/0027-destructive-account-actions-undo-window-and-typed-confirmation.md). |
| S10 | Message routes scope every query by `recipientId: session.user._id`; a foreign id is a 404. | message routes | Filter includes `recipientId`. |

## 2. Recipient-control rules

- **Every setting saves itself.** Settings controls are optimistic mutations with rollback and a toast on error. No page-level Save button in Settings.
- **Profile edits are a draft.** The Profile page holds a local draft (preview updates live) and saves on **Save changes** in the `UnsavedChangesBar`; **Discard** sends nothing.
- **Pausing is calm.** Message Acceptance off shows "taking a breather" to visitors; answers stay visible. Never render it as an error.
- **Settings are per account, appearance is per device.** Palette and mode live in browser storage, not the API.
- **Defaults favour safety:** quarantine on, Balanced, hidden previews on, publish-by-default off, suggestions on.

## 3. Visitor (sender) rules

- `/u/[username]` never requires a session and never calls authenticated endpoints.
- Senders see microcopy that reinforces anonymity ("maya can't see who you are", "Sent. maya will never know it was you.").
- Suggested Messages load only when `offerSuggestions` is true **and** after the profile has loaded (no wasted AI calls for paused or unknown profiles).
- 404 profiles show "Nobody's home at this link." with **Claim /u/name**; no retries.

## 4. UI conventions

| Topic | Rule | Reference |
| :--- | :--- | :--- |
| Components | Build from shadcn elements; design via opt-in CVA variants; `className` for layout only. | [Chapter 13 §6](../13-design-system-and-theming.md#6-elements-shadcn-first-design-through-variants) |
| Colour | Semantic tokens only; no raw Tailwind palette colours; no manual `dark:` colour overrides. | [Chapter 13 §3](../13-design-system-and-theming.md#3-token-reference) |
| Themes | Every screen must work in all 6 palette × mode combinations; check with the Storybook toolbar or `pnpm docs:screenshots`. | `pnpm theme:contrast` |
| Accessibility | One `<main>`; labelled controls (`FieldLabel`, `aria-label` on icon buttons); 44px targets; `motion-safe:` animations; dialogs have titles; focus defaults to the safe choice in risky dialogs. | Story tests (axe) |
| Option sets | 2–7 choices → `ToggleGroup` (`chip` filters, `segment` toggles); items are radios in tests. | — |
| Loading | `Skeleton` for content, `Spinner data-icon="inline-start"` + `disabled` inside buttons. | — |
| Keyboard | Inbox shortcuts are ignored while typing or when any dialog is open, and never act on quarantined cards. | `use-inbox-keyboard.controller.ts` |

## 5. Copy and tone

- **Plain, warm, short.** Sentence case, no exclamation-mark stacking, no jargon ("toxicity score", "fingerprint").
- **Name things with glossary terms:** "Anonymous Message" (not "feedback"), "Public Profile Link" (not "share link"), "Message Acceptance" (not "inbox status"), "Sender Hash" (not "fingerprint").
- **Explain consequences in the hint line**, for example "Changing it changes your link. The old link stops working, so update your bio." and "Public answers go too. You get 10 seconds to undo."
- **Never blame the visitor or the Recipient.** Held content is "Hidden. Flagged as hurtful.", not "Toxic message blocked".
- **Sentiment Tags** display as 💖 Sweet · 🤔 Curious · 🔥 Spicy · 💡 Advice · 👻 Note.

## 6. Feature switches and where they are read

| Preference | Read by | Effect |
| :--- | :--- | :--- |
| `isAcceptingMessage` | `send-message` (404), public answers (`isAcceptingMessages`), sidebar, ⌘K | Paused state |
| `messagePreferences.offerSuggestions` | public answers → `use-send-message` | Show/fetch Suggested Messages |
| `messagePreferences.publishByDefault` | `use-inbox` → Smart Reply | Initial publish switch |
| `safetySettings.quarantineEnabled`, `sensitivity` | `send-message` → `shouldQuarantine` | Quarantine routing |
| `safetySettings.blurSpicy` | `use-inbox` → `concealSpicy` | Spicy concealment |
| `showAmaBanner` | public answers, `VisitorPreview` | Banner visibility |
| `notificationSettings.*` | `send-message` (email, push), `daily-digest` (`emailAlerts = daily`), `use-inbox` (live toast `hideMessageText`), Settings | Alert channels |

When you add a preference, add a row here and in [Chapter 12 §5.7](../12-product-guide-and-features.md#57-settings-dashboardsettings).
