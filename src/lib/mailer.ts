import nodemailer from "nodemailer";

/**
 * Nodemailer transporter configured from environment variables.
 *
 * Supported providers (all free):
 *  - Gmail: SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=you@gmail.com SMTP_PASS=<app-password>
 *  - Brevo: SMTP_HOST=smtp-relay.brevo.com SMTP_PORT=587 SMTP_USER=you@example.com SMTP_PASS=<brevo-key>
 *  - Ethereal (local dev / testing): set SMTP_HOST=smtp.ethereal.email and use ethereal credentials
 *
 * Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional env vars: SMTP_FROM (defaults to SMTP_USER)
 */
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const FROM_ADDRESS =
  process.env.SMTP_FROM ??
  `GhostMsg 👻 <${process.env.SMTP_USER ?? "noreply@ghostmsg.app"}>`;
