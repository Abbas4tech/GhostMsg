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
  /** Link to the inbox. */
  dashboardUrl?: string;
  /** Message text preview; `null` when the recipient hides message text. */
  messagePreview: string | null;
  sentimentTag?: string;
  username: string;
}

export default function NewMessageAlertEmail({
  username,
  messagePreview,
  sentimentTag = "neutral",
  dashboardUrl = "https://ghost-msg.vercel.app/dashboard",
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
            format: "woff2",
            url: "https://fonts.gstatic.com/s/roboto/v27/KF0mCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
          }}
        />
      </Head>
      <Preview>You received a new anonymous message on GhostMsg! 👻</Preview>
      <Section style={{ fontFamily: "sans-serif", padding: "20px" }}>
        <Row>
          <Heading as="h2">Hey @{username}! 👻</Heading>
        </Row>
        {messagePreview === null ? (
          <Row>
            <Text style={{ color: "#4b5563", fontSize: "16px" }}>
              Someone sent you a new anonymous message. Open your inbox to read
              it. (You chose to keep message text out of notifications.)
            </Text>
          </Row>
        ) : (
          <>
            <Row>
              <Text style={{ color: "#4b5563", fontSize: "16px" }}>
                Someone just sent you an anonymous message on your public
                profile:
              </Text>
            </Row>
            <Row>
              <Section
                style={{
                  backgroundColor: "#f3f4f6",
                  borderLeft: "4px solid #9333ea",
                  borderRadius: "12px",
                  margin: "12px 0",
                  padding: "16px",
                }}
              >
                <Text
                  style={{
                    color: "#111827",
                    fontSize: "18px",
                    fontWeight: 500,
                  }}
                >
                  "{messagePreview}"
                </Text>
                <Text style={{ color: "#6b7280", fontSize: "12px" }}>
                  Tone: {sentimentTag.toUpperCase()}
                </Text>
              </Section>
            </Row>
          </>
        )}
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
            Open Dashboard & Reply
          </Button>
        </Row>
        <Row>
          <Text
            style={{ color: "#9ca3af", fontSize: "12px", marginTop: "24px" }}
          >
            You can change your email notification preferences in your GhostMsg
            dashboard settings at any time.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
