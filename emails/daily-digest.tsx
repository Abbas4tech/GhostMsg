import {
  Button,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type React from "react";

export interface DailyDigestEmailProps {
  dashboardUrl?: string;
  /** Newest messages; empty when the recipient hides message text. */
  previews: { sentimentTag: string; text: string }[];
  total: number;
  username: string;
}

const countLabel = (total: number): string =>
  total === 1 ? "1 new anonymous message" : `${total} new anonymous messages`;

/** Once-a-day summary for recipients who chose "Daily digest". */
export default function DailyDigestEmail({
  username,
  total,
  previews,
  dashboardUrl = "https://ghost-msg.vercel.app/dashboard",
}: DailyDigestEmailProps): React.JSX.Element {
  const remaining = total - previews.length;

  return (
    <Html dir="ltr" lang="en">
      <Head>
        <title>Your GhostMsg daily digest</title>
      </Head>
      <Preview>{`You have ${countLabel(total)} on GhostMsg 👻`}</Preview>
      <Section style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <Row>
          <Heading as="h2">Hey @{username}! 👻</Heading>
        </Row>
        <Row>
          <Text style={{ fontSize: "16px", color: "#4b5563" }}>
            Since your last digest you received {countLabel(total)}.
          </Text>
        </Row>
        {previews.map((preview) => (
          <Row key={`${preview.sentimentTag}-${preview.text}`}>
            <Section
              style={{
                backgroundColor: "#f3f4f6",
                padding: "14px 16px",
                borderRadius: "12px",
                margin: "8px 0",
                borderLeft: "4px solid #9333ea",
              }}
            >
              <Text style={{ fontSize: "16px", color: "#111827", margin: 0 }}>
                "{preview.text}"
              </Text>
              <Text style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                Tone: {preview.sentimentTag.toUpperCase()}
              </Text>
            </Section>
          </Row>
        ))}
        {previews.length > 0 && remaining > 0 ? (
          <Row>
            <Text style={{ fontSize: "14px", color: "#6b7280" }}>
              {`…and ${remaining} more in your inbox.`}
            </Text>
          </Row>
        ) : null}
        {previews.length === 0 ? (
          <Row>
            <Text style={{ fontSize: "14px", color: "#6b7280" }}>
              You chose to keep message text out of notifications. Open your
              inbox to read them.
            </Text>
          </Row>
        ) : null}
        <Row>
          <Button
            href={dashboardUrl}
            style={{
              backgroundColor: "#9333ea",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
              marginTop: "16px",
            }}
          >
            Open your inbox
          </Button>
        </Row>
        <Row>
          <Text
            style={{ fontSize: "12px", color: "#9ca3af", marginTop: "24px" }}
          >
            You get this because email alerts are set to "Daily digest". Change
            it in Settings → Notifications. Quarantined messages are never
            included.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
