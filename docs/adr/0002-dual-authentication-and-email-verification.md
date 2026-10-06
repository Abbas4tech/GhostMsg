# Dual Authentication Strategy and Email Verification

We authenticate users via NextAuth using Credentials (username/email + bcrypt password) and Google OAuth, enforcing mandatory 6-digit email verification for credentials-based signups through Resend. This prevents unverified email registrations from accessing the dashboard while providing a frictionless one-click Google sign-in fallback that automatically provisions verified accounts.
