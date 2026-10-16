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
      <Section style={{ fontFamily: "sans-serif", padding: "20px" }}>
        <Row>
          <Heading as="h2">Hey @{username}! 👻</Heading>
        </Row>
        <Row>
          <Text style={{ color: "#4b5563", fontSize: "16px" }}>
            Since your last digest you received {countLabel(total)}.
          </Text>
        </Row>
        {previews.map((preview) => (
          <Row key={`${preview.sentimentTag}-${preview.text}`}>
            <Section
              style={{
                backgroundColor: "#f3f4f6",
                borderLeft: "4px solid #9333ea",
                borderRadius: "12px",
                margin: "8px 0",
                padding: "14px 16px",
              }}
            >
              <Text style={{ color: "#111827", fontSize: "16px", margin: 0 }}>
                "{preview.text}"
              </Text>
              <Text style={{ color: "#6b7280", fontSize: "12px", margin: 0 }}>
                Tone: {preview.sentimentTag.toUpperCase()}
              </Text>
            </Section>
          </Row>
        ))}
        {previews.length > 0 && remaining > 0 ? (
          <Row>
            <Text style={{ color: "#6b7280", fontSize: "14px" }}>
              {`…and ${remaining} more in your inbox.`}
            </Text>
          </Row>
        ) : null}
        {previews.length === 0 ? (
          <Row>
            <Text style={{ color: "#6b7280", fontSize: "14px" }}>
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
              borderRadius: "8px",
              color: "#ffffff",
              display: "inline-block",
              fontWeight: 600,
              marginTop: "16px",
              padding: "12px 24px",
              textDecoration: "none",
            }}
          >
            Open your inbox
          </Button>
        </Row>
        <Row>
          <Text
            style={{ color: "#9ca3af", fontSize: "12px", marginTop: "24px" }}
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
