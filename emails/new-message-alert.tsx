import {
  Button,
  Font,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type React from "react";

interface NewMessageAlertEmailProps {
  messagePreview: string;
  sentimentTag?: string;
  username: string;
}

export default function NewMessageAlertEmail({
  username,
  messagePreview,
  sentimentTag = "neutral",
}: NewMessageAlertEmailProps): React.JSX.Element {
  return (
    <Html dir="ltr" lang="en">
      <Head>
        <title>New Anonymous Message on GhostMsg</title>
        <Font
          fallbackFontFamily="Verdana"
          fontFamily="Roboto"
          fontStyle="normal"
          fontWeight={400}
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KF0mCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
        />
      </Head>
      <Preview>You received a new anonymous message on GhostMsg! 👻</Preview>
      <Section style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <Row>
          <Heading as="h2">Hey @{username}! 👻</Heading>
        </Row>
        <Row>
          <Text style={{ fontSize: "16px", color: "#4b5563" }}>
            Someone just sent you an anonymous message on your public profile:
          </Text>
        </Row>
        <Row>
          <Section
            style={{
              backgroundColor: "#f3f4f6",
              padding: "16px",
              borderRadius: "12px",
              margin: "12px 0",
              borderLeft: "4px solid #9333ea",
            }}
          >
            <Text
              style={{ fontSize: "18px", fontWeight: 500, color: "#111827" }}
            >
              "{messagePreview}"
            </Text>
            <Text style={{ fontSize: "12px", color: "#6b7280" }}>
              Tone: {sentimentTag.toUpperCase()}
            </Text>
          </Section>
        </Row>
        <Row>
          <Button
            href="https://ghostmsg.app/dashboard"
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
            Open Dashboard & Reply
          </Button>
        </Row>
        <Row>
          <Text
            style={{ fontSize: "12px", color: "#9ca3af", marginTop: "24px" }}
          >
            You can change your email notification preferences in your GhostMsg
            dashboard settings at any time.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
