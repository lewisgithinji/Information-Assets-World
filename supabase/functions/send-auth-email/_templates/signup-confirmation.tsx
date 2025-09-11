import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface SignupConfirmationEmailProps {
  confirmationUrl: string
  siteName?: string
}

export const SignupConfirmationEmail = ({
  confirmationUrl,
  siteName = "Information Assets World",
}: SignupConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to {siteName} - Confirm your account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Welcome to {siteName}</Heading>
        </Section>
        
        <Section style={content}>
          <Text style={text}>
            Thank you for joining Information Assets World, the premier platform for academic conferences, research papers, and professional networking in information management.
          </Text>
          
          <Text style={text}>
            To complete your registration and access all features, please confirm your email address by clicking the button below:
          </Text>
          
          <Section style={buttonContainer}>
            <Link href={confirmationUrl} style={button}>
              Confirm Your Account
            </Link>
          </Section>
          
          <Text style={smallText}>
            Or copy and paste this link into your browser:
          </Text>
          <Text style={linkText}>{confirmationUrl}</Text>
          
          <Text style={text}>
            Once confirmed, you'll be able to:
          </Text>
          <Text style={listItem}>• Register for upcoming conferences and events</Text>
          <Text style={listItem}>• Access our research paper database</Text>
          <Text style={listItem}>• Connect with professionals in your field</Text>
          <Text style={listItem}>• Stay updated on the latest industry developments</Text>
          
          <Text style={smallText}>
            If you didn't create an account with us, you can safely ignore this email.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            Best regards,<br />
            The Information Assets World Team
          </Text>
          <Text style={footerText}>
            This email was sent to you because you registered for an account on {siteName}.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  padding: '32px 0',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
}

const content = {
  padding: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const listItem = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
  paddingLeft: '16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0 8px',
}

const linkText = {
  color: '#2563eb',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
  wordBreak: 'break-all' as const,
}

const footer = {
  borderTop: '1px solid #e2e8f0',
  paddingTop: '24px',
  marginTop: '32px',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}