import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  otp,
  username,
}: VerificationEmailProps): React.JSX.Element {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KF0mCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
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
