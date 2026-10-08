# GhostMsg

GhostMsg is an anonymous messaging platform where users create personal profiles to receive unmoderated, identity-free feedback, confessions, and questions from the public.

## Language

**Anonymous Message**:
A piece of text content submitted by an unauthenticated visitor to a user's public profile without disclosing sender identity or metadata.
_Avoid_: Feedback, comment, post, submission, whisper

**Recipient**:
A registered user who owns a public profile and receives anonymous messages in their inbox.
_Avoid_: Target, receiver, host, account owner

**Public Profile Link**:
A unique, shareable URL path (`/u/[username]`) enabling anyone to send anonymous messages to a specific recipient.
_Avoid_: Inbox link, share link, profile URL, bio link

**Message Acceptance**:
A toggleable user preference controlling whether a recipient's public profile is open to receiving new anonymous messages.
_Avoid_: Active status, open inbox, message switch, receiving toggle

**Verification Code**:
A temporary, time-limited numerical one-time pass code sent via email to confirm ownership of an email address during registration.
_Avoid_: OTP, activation code, auth token, confirm PIN

**Suggested Message**:
A generated prompt or question presented to visitors on a recipient's profile to inspire message ideas.
_Avoid_: AI question, template, sample prompt, starter message

**Sender Hash**:
A one-way cryptographic fingerprint generated on submission to allow rate limiting and recipient blocklists without recording or exposing raw sender IP addresses.
_Avoid_: User ID, sender fingerprint, IP address, sender token

**Public Q&A**:
A published pairing of an anonymous message and the recipient's authored response, publicly visible on the recipient's profile or exported as a shareable card.
_Avoid_: Thread, post, broadcast, comment reply

**Quarantined Message**:
An anonymous message flagged by content moderation as toxic, abusive, or spam, isolated into a separate inbox view rather than delivered to the primary inbox.
_Avoid_: Spam, deleted message, hidden feedback

**AMA Prompt**:
A recipient-defined theme, topic, or question displayed on their public profile link to guide visitor submissions.
_Avoid_: Bio, status, custom headline, bio title

**Sentiment Tag**:
A classification label representing the emotional tone of an anonymous message.
_Avoid_: Vibe, mood score, AI emotion, category

