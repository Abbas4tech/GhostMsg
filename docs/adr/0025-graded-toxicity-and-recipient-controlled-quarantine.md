# ADR 0025: Graded Toxicity and Recipient-Controlled Quarantine

## Status
**Accepted** (2026-10-14). Refines the moderation of [ADR 0010](0010-standalone-messages-schema-and-feature-architecture.md) (binary `isToxic` → quarantine). Related: [ADR 0024](0024-profile-preferences-data-model-and-settings-api.md) (where the settings live).

---

## Context

Moderation returned a yes/no `isToxic`, and every "toxic" message was quarantined. The redesigned Settings let each Recipient choose **Quarantine on/off** and a **Sensitivity** (Relaxed · Balanced · Strict), plus **Blur Spicy**. A binary verdict can't express three thresholds, and different Recipients want different trade-offs between seeing everything and being protected.

## Decisions

| # | Decision |
| :-- | :--- |
| D1 | Moderation returns a **graded `toxicity`**: `none` < `borderline` < `hurtful` < `severe` (definitions in the prompt, [Chapter 17 §4.1](../17-trust-safety-and-privacy.md#41-graded-toxicity)). `isToxic` is kept as `hurtful` or worse for any caller that needs a boolean. An old-shape reply `{ isToxic: true }` maps to `severe`. |
| D2 | A pure policy `shouldQuarantine(toxicity, safetySettings)` (`src/server/ai/quarantine-policy.ts`) quarantines when `quarantineEnabled` and `rank(toxicity) ≥ rank(threshold)`, with thresholds **Relaxed → severe, Balanced → hurtful, Strict → borderline**. Defaults: enabled + Balanced. |
| D3 | The decision is **made once at send time** and stored as `isQuarantined`. Changing sensitivity affects future messages only. |
| D4 | **Fail open for delivery:** without an AI key, on error or on unparsable output, toxicity is `none` (delivered to the inbox). Never block a message because AI was unavailable. |
| D5 | **Blur Spicy is presentation, not moderation:** a client-side concealment of `sentimentTag === "spicy"` cards when `safetySettings.blurSpicy` is on. Spicy messages still alert and still appear in the main inbox. |
| D6 | Quarantined messages **never alert** (email or push), are concealed in the UI, and reveal through a dialog whose default focus is "Keep hidden". |

## Considered options

- **Store `toxicity` on the message and filter at read time**, so sensitivity changes apply retroactively. Rejected for now: it would put moderation semantics in every inbox query and change counts after the fact. Easy to add later (new field + backfill as `none`).
- **Fail closed (quarantine when AI fails).** Rejected: an AI outage would silently hide every message from every Recipient, which is worse than an occasional unfiltered message the Recipient can still delete or block.
- **Auto-delete severe messages.** Rejected: it violates "moderation never deletes" (the Recipient stays in control and can report abuse with evidence).

## Consequences

- The policy and its thresholds are unit-tested (`quarantine-policy.test.ts`); the prompt and level definitions are the single place to tune moderation.
- UI copy ("Balanced holds back clearly hurtful or spammy messages. Strict also holds borderline ones.") must change together with the thresholds.
- Moderation still costs one Gemini call per message on the send path (synchronous, ~hundreds of ms).
