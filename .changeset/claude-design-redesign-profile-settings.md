---
"ghostmsg": minor
---

Claude Design redesign, shadcn-first UI, a Profile & Settings backend, daily digests and agent-first docs.

- **Design:** three palettes (Soft spectral, Midnight confessional, Playful paper) × light/dark, chosen per device with no flash on load. Every screen is rebuilt from shadcn (Radix) elements, with the look applied through opt-in CVA variants (ADR 0022, ADR 0023).
- **Profile:** display name, a photo resized in the browser, the AMA Prompt with AI ideas and a banner switch, username change (the old link stops working), and a live "what visitors see" preview behind an unsaved-changes bar (ADR 0023, ADR 0024).
- **Settings:**
  - Messages, Safety, Notifications, Appearance, Data and a Danger zone, saved per control.
  - Graded toxicity with a Recipient-controlled quarantine sensitivity (ADR 0025).
  - Quiet hours and hidden previews for email, push and the live toast (ADR 0026).
  - Delete all with a 10-second undo, and delete account with a typed confirmation (ADR 0027).
- **API:**
  - New: `GET/PATCH /api/user/profile`, `PATCH /api/user/username`, `GET/PATCH /api/user/preferences`, `DELETE /api/messages`, `DELETE /api/user`, `POST /api/ai/ama-suggestions` and `GET /api/cron/daily-digest`.
  - Extended: the notification and block-sender endpoints, and the public answers endpoint.
- **Fixes:** exports are allow-listed (no Sender Hashes); the live toast is silent for quarantined messages and hides text by default; daily digests are actually sent (Vercel Cron + `CRON_SECRET`); hidden-text alert emails no longer quote a placeholder (ADR 0029).
- **Docs:** chapters 12–19, agent guides and rules, ADRs 0022–0029, and screenshots generated from stories (ADR 0028).
