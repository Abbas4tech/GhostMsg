import {
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

interface VerificationEmailProps {
  otp: string;
  username: string;
}

export default function VerificationEmail({
  otp,
  username,
}: VerificationEmailProps): React.JSX.Element {
  return (
    <Html dir="ltr" lang="en">
      <Head>
        <title>Verification Code</title>
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
      <Preview>Here &apos;s your Verification code: {otp}</Preview>
      <Section>
        <Row>
          <Heading as="h2">Hello {username}</Heading>
        </Row>
        <Row>
          <Text>
            Thankyou for registering. Please use the following Verification code
            to complete your registration
          </Text>
        </Row>
        <Row>
          <Text>{otp}</Text>
        </Row>
        <Row>
          <Text>
            If you did not request this code, please ignore this email.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
