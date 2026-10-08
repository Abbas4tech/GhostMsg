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
