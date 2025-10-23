import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
  Img,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface ConfirmationEmailProps {
  fullName: string;
  trainingInterest: string;
  referenceNumber: string;
}

export const ConfirmationEmail = ({
  fullName,
  trainingInterest,
  referenceNumber,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        {/* Logo */}
        <Section style={header}>
          <Img
            src="https://informationassetsworld.com/lovable-uploads/7edae356-b2d1-4e7d-96ba-9dcadd8a7061.png"
            width="150"
            alt="RIMEA Logo"
            style={logo}
          />
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Thank you for your interest!</Heading>
          
          <Text style={text}>Dear {fullName},</Text>
          
          <Text style={text}>
            Thank you for your interest in RIMEA professional training programs!
          </Text>
          
          <Text style={text}>
            We've received your inquiry for <strong>{trainingInterest}</strong> and our team will contact you within 24 hours to discuss:
          </Text>
          
          <Text style={list}>
            ✓ Available training programs and dates<br/>
            ✓ Customized solutions for your organization<br/>
            ✓ Pricing and payment options<br/>
            ✓ Any questions you may have
          </Text>
          
          <Hr style={divider} />
          
          <Text style={text}>
            <strong>📞 Urgent? Call us directly:</strong><br/>
            +254 770 694 598 (Kenya)<br/>
            +254 721 490 862 (Kenya)
          </Text>
          
          <Text style={text}>
            <strong>📧 Email:</strong>{" "}
            <Link href="mailto:training@rimeastafrica.org" style={link}>
              training@rimeastafrica.org
            </Link>
          </Text>
          
          <Hr style={divider} />
          
          <Text style={footer}>
            Your Reference: <strong>{referenceNumber}</strong><br/>
            NITA Registered: NITA/TRN/01484<br/>
            <Link href="https://www.rimeastafrica.org" style={link} target="_blank">
              www.rimeastafrica.org
            </Link>
          </Text>
          
          <Text style={footer}>
            Best regards,<br/>
            <strong>Capacity Building Team</strong><br/>
            Records and Information Management East Africa
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ConfirmationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
  borderRadius: "8px",
};

const header = {
  padding: "20px 30px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const content = {
  padding: "0 30px",
};

const h1 = {
  color: "#0B5FFF",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const list = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "28px",
  margin: "16px 0",
  paddingLeft: "20px",
};

const link = {
  color: "#0B5FFF",
  textDecoration: "underline",
};

const divider = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: "16px 0",
};
